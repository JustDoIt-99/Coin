package com.sangyunpark.backend.market.socketClient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sangyunpark.backend.market.dto.response.MarketResponse;
import com.sangyunpark.backend.market.dto.response.TickerResponse;
import com.sangyunpark.backend.market.restClient.UpbitMarketClient;
import jakarta.annotation.PostConstruct;
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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Component
public class UpbitTickerWebSocketClient {

    private static final String UPBIT_WS_URL = "wss://api.upbit.com/websocket/v1";
    private static final int RECONNECT_DELAY_SECONDS = 3;
    private static final String TICKER_TOPIC = "/topic/ticker";

    private final UpbitMarketClient upbitMarketClient;
    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final TaskScheduler taskScheduler;
    private final StandardWebSocketClient webSocketClient;

    private final AtomicBoolean reconnectScheduled = new AtomicBoolean(false);
    private final AtomicBoolean shuttingDown = new AtomicBoolean(false);

    private final Map<String, TickerResponse> tickerCache = new ConcurrentHashMap<>();

    private volatile WebSocketSession session;
    private volatile ScheduledFuture<?> reconnectFuture;
    private volatile List<String> subscribeMarketCodes = List.of();

    public UpbitTickerWebSocketClient(
            UpbitMarketClient upbitMarketClient,
            ObjectMapper objectMapper,
            SimpMessagingTemplate messagingTemplate,
            @Qualifier("upbitTaskScheduler") TaskScheduler taskScheduler
    ) {
        this.upbitMarketClient = upbitMarketClient;
        this.objectMapper = objectMapper;
        this.messagingTemplate = messagingTemplate;
        this.taskScheduler = taskScheduler;
        this.webSocketClient = new StandardWebSocketClient();
    }

    @PostConstruct
    public void init() {
        connect();
    }

    @PreDestroy
    public void shutdown() {
        shuttingDown.set(true);
        cancelReconnect();
        closeSession();
        log.info("Upbit ticker 웹소켓 클라이언트 종료");
    }

    public synchronized void connect() {
        if (shuttingDown.get()) {
            log.info("종료 중이므로 웹소켓 연결을 시도하지 않습니다.");
            return;
        }

        if (isSessionOpen()) {
            log.info("이미 Upbit ticker 웹소켓이 연결되어 있습니다.");
            return;
        }

        List<String> marketCodes;
        try {
            marketCodes = getMarketCodes();
        } catch (Exception e) {
            log.error("Upbit ticker 웹소켓 연결 준비 실패. 마켓 목록 조회 실패", e);
            scheduleReconnect();
            return;
        }

        connectWebSocket(marketCodes);
    }

    private void connectWebSocket(List<String> marketCodes) {
        webSocketClient.execute(new BinaryWebSocketHandler() {

            @Override
            public void afterConnectionEstablished(WebSocketSession session) throws Exception {
                UpbitTickerWebSocketClient.this.session = session;
                reconnectScheduled.set(false);
                cancelReconnect();

                String subscribeMessage = objectMapper.writeValueAsString(
                        List.of(
                                Map.of("ticket", "coinco-ticker"),
                                Map.of("type", "ticker", "codes", marketCodes)
                        )
                );

                session.sendMessage(new TextMessage(subscribeMessage));
                log.info("Upbit ticker 웹소켓 연결 성공, 구독중인 마켓 개수: {}", marketCodes.size());
            }

            @Override
            protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
                ByteBuffer buffer = message.getPayload();
                String payload = StandardCharsets.UTF_8.decode(buffer).toString();

                try {
                    TickerResponse ticker = objectMapper.readValue(payload, TickerResponse.class);
                    String marketCode = ticker.marketCode();

                    if (marketCode == null || marketCode.isBlank()) {
                        log.debug("marketCode가 비어있는 ticker 메시지는 무시합니다. payload={}", payload);
                        return;
                    }

                    tickerCache.put(marketCode, ticker);
                    messagingTemplate.convertAndSend(TICKER_TOPIC, ticker);

                } catch (Exception e) {
                    log.error("Ticker 메시지 파싱 실패. payload={}", payload, e);
                }
            }

            @Override
            public void handleTransportError(WebSocketSession session, Throwable exception) {
                log.error("Upbit ticker 웹소켓 transport error", exception);
                clearSession(session);
                closeSession(session);
                scheduleReconnect();
            }

            @Override
            public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
                log.warn("Upbit ticker 웹소켓 연결 종료. status={}", status);
                clearSession(session);

                if (!shuttingDown.get()) {
                    scheduleReconnect();
                }
            }
        }, UPBIT_WS_URL).whenComplete((session, ex) -> {
            if (ex != null) {
                log.error("Upbit ticker 웹소켓 연결 실패", ex);
                scheduleReconnect();
            }
        });
    }

    private void scheduleReconnect() {
        if (shuttingDown.get()) {
            return;
        }

        if (!reconnectScheduled.compareAndSet(false, true)) {
            log.debug("이미 재연결이 예약되어 있습니다.");
            return;
        }

        reconnectFuture = taskScheduler.schedule(() -> {
            try {
                log.info("Upbit ticker 웹소켓 재연결을 시도합니다.");
                connect();
            } catch (Exception e) {
                log.error("Upbit ticker 웹소켓 재연결 중 예외 발생", e);
                reconnectScheduled.set(false);
                scheduleReconnect();
            }
        }, Instant.now().plusSeconds(RECONNECT_DELAY_SECONDS));

        log.info("Upbit ticker 웹소켓 {}초 후 재연결 예약", RECONNECT_DELAY_SECONDS);
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

    private void closeSession() {
        WebSocketSession currentSession = this.session;
        this.session = null;
        closeSession(currentSession);
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
            log.error("웹소켓 세션 종료 실패", e);
        }
    }

    private List<String> getMarketCodes() {
        if (!subscribeMarketCodes.isEmpty()) {
            return subscribeMarketCodes;
        }

        List<String> marketCodes = upbitMarketClient.fetchMarkets()
                .stream()
                .map(MarketResponse::market)
                .toList();

        subscribeMarketCodes = marketCodes;
        return marketCodes;
    }

    public void updateTickerCache(List<TickerResponse> tickers) {
        tickers.forEach(ticker -> {
            String marketCode = ticker.marketCode();
            if (marketCode == null || marketCode.isBlank()) {
                return;
            }
            tickerCache.put(marketCode, ticker);
        });
    }


    public synchronized void refreshMarketSubscription() {
        this.subscribeMarketCodes = upbitMarketClient.fetchMarkets()
                .stream()
                .map(MarketResponse::market)
                .toList();

        log.info("Upbit 마켓 목록 갱신 완료. market count={}", subscribeMarketCodes.size());

        closeSession();
        scheduleReconnect();

        log.info("Upbit 마켓 구독 재연결 예약 완료");
    }
}