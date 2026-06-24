package com.sangyunpark.backend.order.event;

public record LimitOrderCancelledEvent(
        String marketCode
) {
}
