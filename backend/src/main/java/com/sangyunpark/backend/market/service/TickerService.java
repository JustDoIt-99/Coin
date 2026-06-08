package com.sangyunpark.backend.market.service;

import com.sangyunpark.backend.market.dto.response.TickerResponse;
import com.sangyunpark.backend.market.restClient.UpbitTickerClient;
import com.sangyunpark.backend.market.socketClient.UpbitTickerWebSocketClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TickerService {

    private final UpbitTickerClient upbitTickerClient;
    private final UpbitTickerWebSocketClient upbitTickerWebSocketClient;

    public List<TickerResponse> getLatestTickers(List<String> marketCodes) {
        List<TickerResponse> tickers = upbitTickerClient.fetchTickers(marketCodes);
        upbitTickerWebSocketClient.updateTickerCache(tickers);
        return tickers;
    }

}
