package com.sangyunpark.backend.order.controller.dto.response;

import com.sangyunpark.backend.order.entity.LimitOrder;
import com.sangyunpark.backend.order.entity.OrderStatus;

import java.math.BigDecimal;

public record LimitSellResponse(
        Long orderId,
        String marketCode,
        BigDecimal quantity,
        BigDecimal limitPrice,
        BigDecimal lockedAmount,
        OrderStatus status
) {

    public static LimitSellResponse from(LimitOrder order) {
        return new LimitSellResponse(
                order.getId(),
                order.getMarketCode(),
                order.getQuantity(),
                order.getLimitPrice(),
                order.getLockedAmount(),
                order.getStatus()
        );
    }
}
