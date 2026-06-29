package com.sangyunpark.backend.asset.controller.dto.response;

import com.sangyunpark.backend.asset.entity.AssetTransferRequest;
import com.sangyunpark.backend.asset.entity.AssetTransferStatus;
import com.sangyunpark.backend.asset.entity.AssetTransferType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminAssetTransferResponse(
        Long id,
        Long userId,
        String userEmail,
        String userNickname,
        String assetCode,
        AssetTransferType type,
        BigDecimal amount,
        String transactionId,
        AssetTransferStatus status,
        LocalDateTime requestedAt
) {

    public static AdminAssetTransferResponse from(AssetTransferRequest request) {
        return new AdminAssetTransferResponse(
                request.getId(),
                request.getUser().getId(),
                request.getUser().getEmail(),
                request.getUser().getNickname(),
                request.getAssetCode(),
                request.getType(),
                request.getAmount(),
                request.getTransactionId(),
                request.getStatus(),
                request.getCreatedAt()
        );
    }
}
