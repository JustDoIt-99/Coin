package com.sangyunpark.backend.order.controller.dto.response;

import java.math.BigDecimal;

public record MarketSellResponse(
        Long orderId,
        String marketCode,
        BigDecimal orderQuantity,
        BigDecimal executedAmount,
        BigDecimal executedPrice,
        BigDecimal executedQuantity,
        BigDecimal cashBalance,
        BigDecimal coinBalance,
        BigDecimal averageBuyPrice
) {
}
