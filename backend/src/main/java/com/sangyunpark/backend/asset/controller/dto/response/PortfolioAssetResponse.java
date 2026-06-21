package com.sangyunpark.backend.asset.controller.dto.response;

import java.math.BigDecimal;

public record PortfolioAssetResponse(
        String assetCode,
        BigDecimal balance,
        BigDecimal averageBuyPrice,
        BigDecimal currentPrice,
        BigDecimal buyAmount,
        BigDecimal valuationAmount,
        BigDecimal profitAmount,
        BigDecimal profitRate,
        BigDecimal weight
) {
}
