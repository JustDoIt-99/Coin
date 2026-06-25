package com.sangyunpark.backend.order.event;

import java.math.BigDecimal;

public record LimitSellOrderCreatedEvent(
        String marketCode,
        BigDecimal limitPrice
) {
}
