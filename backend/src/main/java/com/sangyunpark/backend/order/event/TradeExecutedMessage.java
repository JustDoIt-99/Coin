package com.sangyunpark.backend.order.event;

import com.sangyunpark.backend.order.entity.OrderType;
import com.sangyunpark.backend.order.entity.TradeSide;

import java.math.BigDecimal;

public record TradeExecutedMessage(
        String type,
        Long userId,
        Long tradeHistoryId,
        String marketCode,
        TradeSide tradeSide,
        OrderType orderType,
        BigDecimal quantity,
        BigDecimal price,
        BigDecimal totalAmount
) {
    private static final String TYPE = "TRADE_EXECUTED";

    public static TradeExecutedMessage from(TradeExecutedEvent event) {
        return new TradeExecutedMessage(
                TYPE,
                event.userId(),
                event.tradeHistoryId(),
                event.marketCode(),
                event.tradeSide(),
                event.orderType(),
                event.quantity(),
                event.price(),
                event.totalAmount()
        );
    }
}
