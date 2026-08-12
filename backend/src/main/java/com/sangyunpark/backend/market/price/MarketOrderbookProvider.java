package com.sangyunpark.backend.market.price;

import com.sangyunpark.backend.common.exception.BusinessException;
import com.sangyunpark.backend.market.dto.response.OrderbookResponse;
import com.sangyunpark.backend.market.exception.MarketErrorCode;
import com.sangyunpark.backend.market.restClient.UpbitOrderbookClient;
import com.sangyunpark.backend.market.service.OrderbookSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class MarketOrderbookProvider {

    private final OrderbookCache orderbookCache;
    private final OrderbookSubscriptionService orderbookSubscriptionService;
    private final UpbitOrderbookClient upbitOrderbookClient;

    @Value("${market.orderbook.max-age-seconds:2}")
    private long maxAgeSeconds;

    @Value("${market.orderbook.rest-fallback-enabled:true}")
    private boolean restFallbackEnabled;

    public OrderbookResponse getRequiredOrderbook(String marketCode) {
        orderbookSubscriptionService.subscription(marketCode);

        return orderbookCache.getFresh(marketCode, Duration.ofSeconds(maxAgeSeconds))
                .orElseGet(() -> fetchFallback(marketCode));
    }

    private OrderbookResponse fetchFallback(String marketCode) {
        if (!restFallbackEnabled) {
            throw new BusinessException(MarketErrorCode.ORDERBOOK_NOT_READY);
        }

        OrderbookResponse orderbook = upbitOrderbookClient.fetchOrderbook(marketCode);
        orderbookCache.put(orderbook);
        return orderbook;
    }
}
