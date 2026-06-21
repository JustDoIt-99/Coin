package com.sangyunpark.backend.order.controller.dto.response;

import java.math.BigDecimal;

public record MarketBuyResponse(
        Long orderId,
        String marketCode,
        BigDecimal orderAmount,
        BigDecimal executedAmount,
        BigDecimal executedPrice,
        BigDecimal executedQuantity,
        BigDecimal remainingCashBalance,
        BigDecimal coinBalance,
        BigDecimal averageBuyPrice
) {
}
