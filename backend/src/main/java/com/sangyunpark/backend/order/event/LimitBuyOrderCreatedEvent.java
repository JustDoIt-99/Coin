package com.sangyunpark.backend.order.event;

import java.math.BigDecimal;

public record LimitBuyOrderCreatedEvent(
        String marketCode,
        BigDecimal limitPrice
) {
}
