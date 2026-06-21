package com.sangyunpark.backend.asset.controller.dto.response;

import com.sangyunpark.backend.asset.entity.Asset;

import java.math.BigDecimal;

public record AssetResponse(
        String assetCode,
        BigDecimal balance,
        BigDecimal averageBuyPrice
) {

    public static AssetResponse from(Asset asset) {
        return new AssetResponse(
                asset.getAssetCode(),
                asset.getBalance(),
                asset.getAverageBuyPrice()
        );
    }
}
