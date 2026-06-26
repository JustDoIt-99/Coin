package com.sangyunpark.backend.order.controller.dto.response;

import com.sangyunpark.backend.order.entity.LimitOrder;
import com.sangyunpark.backend.order.entity.OrderStatus;
import com.sangyunpark.backend.order.entity.OrderType;
import com.sangyunpark.backend.order.entity.TradeSide;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PendingLimitOrderResponse(
        Long orderId,
        String marketCode,
        TradeSide tradeSide,
        OrderType orderType,
        OrderStatus status,
        BigDecimal quantity,
        BigDecimal limitPrice,
        BigDecimal lockedAmount,
        BigDecimal executedQuantity,
        LocalDateTime orderedAt
) {

    public static PendingLimitOrderResponse from(LimitOrder order) {
        return new PendingLimitOrderResponse(
                order.getId(),
                order.getMarketCode(),
                order.getTradeSide(),
                order.getOrderType(),
                order.getStatus(),
                order.getQuantity(),
                order.getLimitPrice(),
                order.getLockedAmount(),
                order.getExecutedQuantity(),
                order.getCreatedAt()
        );
    }
}
