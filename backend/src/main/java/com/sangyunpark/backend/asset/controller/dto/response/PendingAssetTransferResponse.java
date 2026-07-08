package com.sangyunpark.backend.asset.controller.dto.response;

import com.sangyunpark.backend.asset.entity.AssetTransferRequest;
import com.sangyunpark.backend.asset.entity.AssetTransferStatus;
import com.sangyunpark.backend.asset.entity.AssetTransferType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PendingAssetTransferResponse(
        Long id,
        String assetCode,
        AssetTransferType type,
        BigDecimal amount,
        String transactionId,
        AssetTransferStatus status,
        LocalDateTime requestedAt
) {

    public static PendingAssetTransferResponse from(AssetTransferRequest request) {
        return new PendingAssetTransferResponse(
                request.getId(),
                request.getAssetCode(),
                request.getType(),
                request.getAmount(),
                request.getTransactionId(),
                request.getStatus(),
                request.getCreatedAt()
        );
    }
}
