package com.sangyunpark.backend.asset.controller.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record PortfolioAssetSummaryResponse(
        BigDecimal cashBalance,
        BigDecimal totalAssetAmount,
        BigDecimal totalBuyAmount,
        BigDecimal totalValuationAmount,
        BigDecimal totalProfitAmount,
        BigDecimal totalProfitRate,
        BigDecimal availableOrderAmount,
        List<PortfolioAssetResponse> assets
) {
}
