package com.sangyunpark.backend.asset.entity;

import com.sangyunpark.backend.common.entity.BaseEntity;
import com.sangyunpark.backend.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AssetTransferRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    private String assetCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssetTransferType type;

    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal amount;

    @Column(nullable = false, length = 64)
    private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssetTransferStatus status;

    @Builder
    private AssetTransferRequest(
            User user,
            String assetCode,
            AssetTransferType type,
            BigDecimal amount,
            String transactionId,
            AssetTransferStatus status
    ) {
        this.user = user;
        this.assetCode = assetCode;
        this.type = type;
        this.amount = amount;
        this.transactionId = transactionId;
        this.status = status;
    }

    public static AssetTransferRequest create(
            User user,
            String assetCode,
            AssetTransferType type,
            BigDecimal amount,
            String transactionId,
            AssetTransferStatus status
    ) {
        return AssetTransferRequest.builder()
                .user(user)
                .assetCode(assetCode)
                .type(type)
                .amount(amount)
                .transactionId(transactionId)
                .status(status)
                .build();
    }

    public void approve() {
        this.status = AssetTransferStatus.COMPLETED;
    }

    public void reject() {
        this.status = AssetTransferStatus.REJECTED;
    }

    public boolean isPendingApproval() {
        return status == AssetTransferStatus.PENDING || status == AssetTransferStatus.PROCESSING;
    }
}
