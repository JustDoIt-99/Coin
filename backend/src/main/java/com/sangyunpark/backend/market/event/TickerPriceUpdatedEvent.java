package com.sangyunpark.backend.market.event;

import java.math.BigDecimal;

public record TickerPriceUpdatedEvent(
        String marketCode,
        BigDecimal tradePrice,
        Long timestamp
) {
}
