package com.sangyunpark.backend.market.price;

import com.sangyunpark.backend.common.exception.BusinessException;
import com.sangyunpark.backend.market.dto.response.TickerResponse;
import com.sangyunpark.backend.market.exception.MarketErrorCode;
import com.sangyunpark.backend.market.restClient.UpbitTickerClient;
import com.sangyunpark.backend.market.socketClient.UpbitTickerWebSocketClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UpbitMarketPriceProvider {

    private final UpbitTickerWebSocketClient tickerWebSocketClient;
    private final UpbitTickerClient tickerClient;

    public BigDecimal getCurrentPrice(String marketCode) {
        TickerResponse ticker = tickerWebSocketClient.getCachedTicker(marketCode)
                .orElseGet(() -> fetchAndCacheTicker(marketCode));

        return ticker.tradePrice();
    }

    private TickerResponse fetchAndCacheTicker(String marketCode) {
        TickerResponse ticker = tickerClient.fetchTickers(List.of(marketCode))
                .stream()
                .findFirst().
                orElseThrow(() -> new BusinessException(MarketErrorCode.MARKET_NOT_FOUND));

        tickerWebSocketClient.updateTickerCache(List.of(ticker));

        return ticker;
    }
}
