package com.sangyunpark.backend.market.service;

import com.sangyunpark.backend.market.socketClient.UpbitTradeWebSocketClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TradeSubscriptionService {

    private final UpbitTradeWebSocketClient upbitTradeWebSocketClient;

    public void subscribe(String marketCode){
        upbitTradeWebSocketClient.subscribe(marketCode);
    }

}
