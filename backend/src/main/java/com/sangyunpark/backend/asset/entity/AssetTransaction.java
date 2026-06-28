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
public class AssetTransaction extends BaseEntity {

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
    private AssetTransactionType type;

    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal amount;

    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal balanceAfter;

    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal lockedBalanceAfter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssetTransactionReferenceType referenceType;

    @Column(nullable = false)
    private Long referenceId;

    @Builder
    private AssetTransaction(
            User user,
            String assetCode,
            AssetTransactionType type,
            BigDecimal amount,
            BigDecimal balanceAfter,
            BigDecimal lockedBalanceAfter,
            AssetTransactionReferenceType referenceType,
            Long referenceId
    ) {
        this.user = user;
        this.assetCode = assetCode;
        this.type = type;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.lockedBalanceAfter = lockedBalanceAfter;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
    }

    public static AssetTransaction create(
            User user,
            String assetCode,
            AssetTransactionType type,
            BigDecimal amount,
            BigDecimal balanceAfter,
            BigDecimal lockedBalanceAfter,
            AssetTransactionReferenceType referenceType,
            Long referenceId
    ) {
        return AssetTransaction.builder()
                .user(user)
                .assetCode(assetCode)
                .type(type)
                .amount(amount)
                .balanceAfter(balanceAfter)
                .lockedBalanceAfter(lockedBalanceAfter)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();
    }
}
