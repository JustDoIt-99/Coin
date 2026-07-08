package com.sangyunpark.backend.market.service;

import com.sangyunpark.backend.market.socketClient.UpbitOrderBookWebSocketClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderbookSubscriptionService {

    private final UpbitOrderBookWebSocketClient upbitOrderBookWebSocketClient;

    public void subscription(String marketCode) {
        upbitOrderBookWebSocketClient.subscribe(marketCode);
    }
}
