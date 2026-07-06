package com.sangyunpark.backend.order.event;

import com.sangyunpark.backend.order.entity.OrderType;
import com.sangyunpark.backend.order.entity.TradeHistory;
import com.sangyunpark.backend.order.entity.TradeSide;

import java.math.BigDecimal;

public record TradeExecutedEvent(
        Long userId,
        Long tradeHistoryId,
        String marketCode,
        TradeSide tradeSide,
        OrderType orderType,
        BigDecimal quantity,
        BigDecimal price,
        BigDecimal totalAmount
) {

    public static TradeExecutedEvent from(TradeHistory tradeHistory) {
        return new TradeExecutedEvent(
                tradeHistory.getUser().getId(),
                tradeHistory.getId(),
                tradeHistory.getMarketCode(),
                tradeHistory.getTradeSide(),
                tradeHistory.getOrderType(),
                tradeHistory.getQuantity(),
                tradeHistory.getPrice(),
                tradeHistory.getTotalAmount()
        );
    }
}
