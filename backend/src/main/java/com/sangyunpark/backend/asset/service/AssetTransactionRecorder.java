package com.sangyunpark.backend.asset.service;

import com.sangyunpark.backend.asset.entity.Asset;
import com.sangyunpark.backend.asset.entity.AssetTransaction;
import com.sangyunpark.backend.asset.entity.AssetTransactionReferenceType;
import com.sangyunpark.backend.asset.entity.AssetTransactionType;
import com.sangyunpark.backend.asset.repository.AssetJpaRepository;
import com.sangyunpark.backend.asset.repository.AssetTransactionJpaRepository;
import com.sangyunpark.backend.common.exception.BusinessException;
import com.sangyunpark.backend.order.exception.OrderErrorCode;
import com.sangyunpark.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AssetTransactionRecorder {

    private final AssetJpaRepository assetJpaRepository;
    private final AssetTransactionJpaRepository assetTransactionJpaRepository;

    public void record(
            Asset asset,
            AssetTransactionType type,
            BigDecimal amount,
            AssetTransactionReferenceType referenceType,
            Long referenceId
    ) {
        Objects.requireNonNull(asset, "asset must not be null");
        Objects.requireNonNull(amount, "amount must not be null");

        save(
                asset.getUser(),
                asset.getAssetCode(),
                type,
                amount,
                asset.getBalance(),
                asset.getLockedBalance(),
                referenceType,
                referenceId
        );
    }

    public void recordCurrentBalance(
            User user,
            String assetCode,
            AssetTransactionType type,
            BigDecimal amount,
            AssetTransactionReferenceType referenceType,
            Long referenceId
    ) {
        Objects.requireNonNull(amount, "amount must not be null");

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        AssetJpaRepository.AssetBalanceSnapshot snapshot = assetJpaRepository
                .findBalanceSnapshotByUserIdAndAssetCode(user.getId(), assetCode)
                .orElseThrow(() -> new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE));

        save(
                user,
                assetCode,
                type,
                amount,
                snapshot.getBalance(),
                snapshot.getLockedBalance(),
                referenceType,
                referenceId
        );
    }

    public void recordCurrentBalanceAll(
            User user,
            String assetCode,
            List<Entry> entries,
            AssetTransactionReferenceType referenceType,
            Long referenceId
    ) {
        List<Entry> positiveEntries = entries.stream()
                .peek(entry -> Objects.requireNonNull(entry.amount(), "amount must not be null"))
                .filter(entry -> entry.amount().compareTo(BigDecimal.ZERO) > 0)
                .toList();

        if (positiveEntries.isEmpty()) {
            return;
        }

        AssetJpaRepository.AssetBalanceSnapshot snapshot = assetJpaRepository
                .findBalanceSnapshotByUserIdAndAssetCode(user.getId(), assetCode)
                .orElseThrow(() -> new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE));

        positiveEntries.forEach(entry -> save(
                user,
                assetCode,
                entry.type(),
                entry.amount(),
                snapshot.getBalance(),
                snapshot.getLockedBalance(),
                referenceType,
                referenceId
        ));
    }

    private void save(
            User user,
            String assetCode,
            AssetTransactionType type,
            BigDecimal amount,
            BigDecimal balanceAfter,
            BigDecimal lockedBalanceAfter,
            AssetTransactionReferenceType referenceType,
            Long referenceId
    ) {
        Objects.requireNonNull(amount, "amount must not be null");

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        assetTransactionJpaRepository.save(
                AssetTransaction.create(
                        user,
                        assetCode,
                        type,
                        amount,
                        balanceAfter,
                        lockedBalanceAfter,
                        referenceType,
                        referenceId
                )
        );
    }

    public record Entry(
            AssetTransactionType type,
            BigDecimal amount
    ) {
    }
}
