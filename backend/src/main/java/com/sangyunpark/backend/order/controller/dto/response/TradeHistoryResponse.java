package com.sangyunpark.backend.order.controller.dto.response;

import com.sangyunpark.backend.order.entity.OrderType;
import com.sangyunpark.backend.order.entity.TradeHistory;
import com.sangyunpark.backend.order.entity.TradeSide;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TradeHistoryResponse(
        Long id,
        String marketCode,
        TradeSide tradeSide,
        OrderType orderType,
        BigDecimal quantity,
        BigDecimal price,
        BigDecimal totalAmount,
        LocalDateTime orderedAt,
        LocalDateTime executedAt
) {

    public static TradeHistoryResponse from(TradeHistory tradeHistory) {
        return new TradeHistoryResponse(
                tradeHistory.getId(),
                tradeHistory.getMarketCode(),
                tradeHistory.getTradeSide(),
                tradeHistory.getOrderType(),
                tradeHistory.getQuantity(),
                tradeHistory.getPrice(),
                tradeHistory.getTotalAmount(),
                tradeHistory.getCreatedAt(),
                tradeHistory.getCreatedAt()
        );
    }
}
