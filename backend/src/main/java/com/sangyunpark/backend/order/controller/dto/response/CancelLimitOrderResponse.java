package com.sangyunpark.backend.order.controller.dto.response;

import com.sangyunpark.backend.order.entity.LimitOrder;
import com.sangyunpark.backend.order.entity.OrderStatus;

import java.math.BigDecimal;

public record CancelLimitOrderResponse(
        Long orderId,
        String marketCode,
        BigDecimal releasedAmount,
        OrderStatus status
) {

    public static CancelLimitOrderResponse of(
            LimitOrder order,
            BigDecimal releasedAmount,
            OrderStatus status
    ) {
        return new CancelLimitOrderResponse(
                order.getId(),
                order.getMarketCode(),
                releasedAmount,
                status
        );
    }
}
