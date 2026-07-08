package com.sangyunpark.backend.order.event;

import com.sangyunpark.backend.order.entity.TradeSide;

public record LimitOrderCancelledEvent(
        String marketCode,
        TradeSide tradeSide
) {
}
