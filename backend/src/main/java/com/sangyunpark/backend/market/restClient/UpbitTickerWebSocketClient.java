package com.sangyunpark.backend.market.restClient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sangyunpark.backend.market.dto.response.MarketResponse;
import com.sangyunpark.backend.market.dto.response.TickerResponse;
import jakarta.annotation.PostConstruct;
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
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Component
public class UpbitTickerWebSocketClient {

    private static final String UPBIT_WS_URL = "wss://api.upbit.com/websocket/v1";
    private static final int RECONNECT_TIME = 3;

    private final UpbitMarketClient upbitMarketClient;
    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final TaskScheduler taskScheduler;
    private final AtomicBoolean reconnecting = new AtomicBoolean(false);

    private final Map<String, TickerResponse> tickerCache = new ConcurrentHashMap<>();

    public UpbitTickerWebSocketClient(
            UpbitMarketClient upbitMarketClient,
            ObjectMapper objectMapper,
            SimpMessagingTemplate messagingTemplate,

            @Qualifier("upbitTaskScheduler")
            TaskScheduler taskScheduler
    ) {
        this.upbitMarketClient = upbitMarketClient;
        this.objectMapper = objectMapper;
        this.messagingTemplate = messagingTemplate;
        this.taskScheduler = taskScheduler;
    }

    @PostConstruct
    public void connect() {
        StandardWebSocketClient client = new StandardWebSocketClient();

        client.execute(new BinaryWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) throws Exception {
                reconnecting.set(false);

                List<String> marketCodes = upbitMarketClient.fetchMarkets()
                        .stream()
                        .map(MarketResponse::market)
                        .toList();

                String subscribeMessage = objectMapper.writeValueAsString(
                        List.of(
                                Map.of("ticket", "coinco-ticker"),
                                Map.of(
                                        "type", "ticker", "codes", marketCodes
                                )
                        )
                );

                session.sendMessage(new TextMessage(subscribeMessage));
                log.info("Upbit ticker 웹소켓 연결 성공, 구독중인 마켓 갯수: {}", marketCodes.size());
            }

            @Override
            protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
                ByteBuffer buffer = message.getPayload();
                String payload = StandardCharsets.UTF_8.decode(buffer).toString();

                try {
                    TickerResponse ticker = objectMapper.readValue(payload, TickerResponse.class);
                    tickerCache.put(ticker.marketCode(), ticker);

                    messagingTemplate.convertAndSend(
                            "/topic/ticker",
                            ticker
                    );
                } catch (Exception e) {
                    log.error("Ticker 파싱 실패. payload={}", payload, e);
                }
            }

            @Override
            public void handleTransportError(WebSocketSession session, Throwable exception) {
                log.error("Upbit ticker 웹소켓 에러", exception);

                try {
                    session.close();
                } catch (Exception e) {
                    log.error("session 종료 에러", e);
                }
            }

            @Override
            public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
                log.warn("Upbit ticker websocket closed: {}", status);
                scheduleReconnect();
            }

        }, UPBIT_WS_URL)
                .whenComplete((session, ex) -> {
                    if(ex != null) {
                        log.error("UpBit 연결 실패", ex);
                        scheduleReconnect();
                    }
                });
    }

    private void scheduleReconnect() {
        if (!reconnecting.compareAndSet(false, true)) {
            return;
        }

        taskScheduler.schedule(
                () -> {
                    try {
                        connect();
                    } finally {
                        reconnecting.set(false);
                    }
                },
                Instant.now().plusSeconds(RECONNECT_TIME)
        );

        log.info("업비트 ticker 웹소켓 {}초 후 재연결", RECONNECT_TIME);
    }

    public List<TickerResponse> getLatestTickers(List<String> marketCodes) {
        return marketCodes.stream()
                .map(tickerCache::get)
                .filter(Objects::nonNull)
                .toList();
    }

    public void putAll(List<TickerResponse> tickers) {
        tickers.forEach(ticker -> {
            String marketCode = ticker.marketCode();
            if (marketCode == null || marketCode.isBlank()) {
                return;
            }
            tickerCache.put(marketCode, ticker);
        });
    }
}