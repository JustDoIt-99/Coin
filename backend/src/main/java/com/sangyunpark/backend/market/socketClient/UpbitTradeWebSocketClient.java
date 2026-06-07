package com.sangyunpark.backend.market.socketClient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sangyunpark.backend.market.dto.response.TradeResponse;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Component
public class UpbitTradeWebSocketClient {

    private static final String UPBIT_WS_URL = "wss://api.upbit.com/websocket/v1";
    private static final int RECONNECT_DELAY_SECONDS = 3;
    private static final String TRADE_TOPIC_PREFIX = "/topic/trade/";

    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final TaskScheduler taskScheduler;
    private final StandardWebSocketClient webSocketClient;

    private final Set<String> subscribedMarketCodes = ConcurrentHashMap.newKeySet();
    private final AtomicBoolean reconnectScheduled = new AtomicBoolean(false);
    private final AtomicBoolean shuttingDown = new AtomicBoolean(false);

    private volatile WebSocketSession session;
    private volatile ScheduledFuture<?> reconnectFuture;

    public UpbitTradeWebSocketClient(
            ObjectMapper objectMapper,
            SimpMessagingTemplate messagingTemplate,
            @Qualifier("upbitTaskScheduler") TaskScheduler taskScheduler
    ) {
        this.objectMapper = objectMapper;
        this.messagingTemplate = messagingTemplate;
        this.taskScheduler = taskScheduler;
        this.webSocketClient = new StandardWebSocketClient();
    }

    public synchronized void subscribe(String marketCode) {
        if (marketCode == null || marketCode.isBlank()) {
            return;
        }

        boolean added = subscribedMarketCodes.add(marketCode);
        if (!added) {
            log.info("이미 구독 중인 trade 마켓입니다. marketCode={}", marketCode);
            return;
        }

        log.info("trade 마켓 구독 추가. marketCode={}, totalCount={}", marketCode, subscribedMarketCodes.size());

        if (isSessionOpen()) {
            sendSubscribeMessage();
            return;
        }

        connect();
    }

    public synchronized void connect() {
        if (shuttingDown.get()) {
            log.info("종료 중이므로 trade 웹소켓 연결을 시도하지 않습니다.");
            return;
        }

        if (isSessionOpen()) {
            log.info("이미 trade 웹소켓이 연결되어 있습니다.");
            return;
        }

        if (subscribedMarketCodes.isEmpty()) {
            log.info("구독할 trade 마켓이 없어 연결하지 않습니다.");
            return;
        }

        connectWebSocket();
    }

    private void connectWebSocket() {
        webSocketClient.execute(new BinaryWebSocketHandler() {

            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                UpbitTradeWebSocketClient.this.session = session;
                reconnectScheduled.set(false);
                cancelReconnect();

                sendSubscribeMessage();
                log.info("Upbit trade 웹소켓 연결 성공");
            }

            @Override
            protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
                ByteBuffer buffer = message.getPayload();
                String payload = StandardCharsets.UTF_8.decode(buffer).toString();

                try {
                    TradeResponse trade = objectMapper.readValue(payload, TradeResponse.class);

                    if (trade.code() == null || trade.code().isBlank()) {
                        log.debug("code가 비어있는 trade 메시지는 무시합니다. payload={}", payload);
                        return;
                    }

                    messagingTemplate.convertAndSend(
                            TRADE_TOPIC_PREFIX + trade.code(),
                            trade
                    );
                } catch (Exception e) {
                    log.error("trade 메시지 파싱 실패. payload={}", payload, e);
                }
            }

            @Override
            public void handleTransportError(WebSocketSession session, Throwable exception) {
                log.error("Upbit trade 웹소켓 transport error", exception);
                clearSession(session);
                closeSession(session);
                scheduleReconnect();
            }

            @Override
            public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
                log.warn("Upbit trade 웹소켓 연결 종료. status={}", status);
                clearSession(session);

                if (!shuttingDown.get()) {
                    scheduleReconnect();
                }
            }
        }, UPBIT_WS_URL).whenComplete((session, ex) -> {
            if (ex != null) {
                log.error("Upbit trade 웹소켓 연결 실패", ex);
                scheduleReconnect();
            }
        });
    }

    private void sendSubscribeMessage() {
        WebSocketSession currentSession = this.session;
        if (currentSession == null || !currentSession.isOpen()) {
            return;
        }

        try {
            String subscribeMessage = objectMapper.writeValueAsString(
                    List.of(
                            Map.of("ticket", "coinco-trade"),
                            Map.of(
                                    "type", "trade",
                                    "codes", List.copyOf(subscribedMarketCodes)
                            )
                    )
            );

            currentSession.sendMessage(new TextMessage(subscribeMessage));
            log.info("Upbit trade subscribe 메시지 전송. marketCount={}", subscribedMarketCodes.size());

        } catch (Exception e) {
            log.error("Upbit trade subscribe 메시지 전송 실패", e);
        }
    }

    private void scheduleReconnect() {
        if (shuttingDown.get()) {
            return;
        }

        if (subscribedMarketCodes.isEmpty()) {
            return;
        }

        if (!reconnectScheduled.compareAndSet(false, true)) {
            log.debug("이미 trade 재연결이 예약되어 있습니다.");
            return;
        }

        reconnectFuture = taskScheduler.schedule(() -> {
            try {
                log.info("Upbit trade 웹소켓 재연결을 시도합니다.");
                connect();
            } catch (Exception e) {
                log.error("Upbit trade 웹소켓 재연결 중 예외 발생", e);
                reconnectScheduled.set(false);
                scheduleReconnect();
            }
        }, Instant.now().plusSeconds(RECONNECT_DELAY_SECONDS));

        log.info("Upbit trade 웹소켓 {}초 후 재연결 예약", RECONNECT_DELAY_SECONDS);
    }

    private void cancelReconnect() {
        ScheduledFuture<?> future = this.reconnectFuture;
        if (future != null && !future.isDone()) {
            future.cancel(false);
        }
    }

    private boolean isSessionOpen() {
        WebSocketSession currentSession = this.session;
        return currentSession != null && currentSession.isOpen();
    }

    private void clearSession(WebSocketSession closedSession) {
        WebSocketSession currentSession = this.session;
        if (currentSession == closedSession) {
            this.session = null;
        }
    }

    private void closeSession(WebSocketSession targetSession) {
        if (targetSession == null) {
            return;
        }

        try {
            if (targetSession.isOpen()) {
                targetSession.close();
            }
        } catch (Exception e) {
            log.error("trade 웹소켓 세션 종료 실패", e);
        }
    }

    private void closeSession() {
        WebSocketSession currentSession = this.session;
        this.session = null;
        closeSession(currentSession);
    }

    @PreDestroy
    public void shutdown() {
        shuttingDown.set(true);
        cancelReconnect();
        closeSession();
        log.info("Upbit trade 웹소켓 클라이언트 종료");
    }
}