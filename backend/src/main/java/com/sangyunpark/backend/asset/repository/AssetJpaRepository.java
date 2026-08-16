package com.sangyunpark.backend.asset.repository;

import com.sangyunpark.backend.asset.entity.Asset;
import com.sangyunpark.backend.user.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface AssetJpaRepository extends JpaRepository<Asset, Long> {

    Optional<Asset> findByUserAndAssetCode(User user, String assetCode);

    List<Asset> findByUserOrderByAssetCodeAsc(User user);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Asset> findForUpdateByUserAndAssetCode(User user, String assetCode);

    @Query("""
            select a.balance as balance,
                   a.lockedBalance as lockedBalance
            from Asset a
            where a.user.id = :userId
              and a.assetCode = :assetCode
            """)
    Optional<AssetBalanceSnapshot> findBalanceSnapshotByUserIdAndAssetCode(
            @Param("userId") Long userId,
            @Param("assetCode") String assetCode
    );

    @Modifying(flushAutomatically = true)
    @Query("""
            update Asset a
            set a.balance = a.balance - :amount,
                a.lockedBalance = a.lockedBalance + :amount
            where a.user.id = :userId
              and a.assetCode = :assetCode
              and a.balance >= :amount
            """)
    int lockBalance(
            @Param("userId") Long userId,
            @Param("assetCode") String assetCode,
            @Param("amount") BigDecimal amount
    );

    @Modifying(flushAutomatically = true)
    @Query("""
            update Asset a
            set a.balance = a.balance + :amount,
                a.lockedBalance = a.lockedBalance - :amount
            where a.user.id = :userId
              and a.assetCode = :assetCode
              and a.lockedBalance >= :amount
            """)
    int releaseLockedBalance(
            @Param("userId") Long userId,
            @Param("assetCode") String assetCode,
            @Param("amount") BigDecimal amount
    );

    @Modifying(flushAutomatically = true)
    @Query("""
            update Asset a
            set a.balance = a.balance + :refundAmount,
                a.lockedBalance = a.lockedBalance - :lockedAmount,
                a.averageBuyPrice = case
                    when a.balance + :refundAmount = 0
                     and a.lockedBalance - :lockedAmount = 0
                    then 0
                    else a.averageBuyPrice
                end
            where a.user.id = :userId
              and a.assetCode = :assetCode
              and a.lockedBalance >= :lockedAmount
            """)
    int useLockedBalance(
            @Param("userId") Long userId,
            @Param("assetCode") String assetCode,
            @Param("lockedAmount") BigDecimal lockedAmount,
            @Param("refundAmount") BigDecimal refundAmount
    );

    @Modifying
    @Query(
            """
                        update Asset a
                        set a.balance = a.balance - :executedAmount
                            where a.user.id = :userId
                            and a.assetCode = :assetCode
                            and a.balance >= :orderAmount
                    """)
    int withdrawMarketBuyIfSufficient(
            @Param("userId") Long userId,
            @Param("assetCode") String assetCode,
            @Param("orderAmount") BigDecimal orderAmount,
            @Param("executedAmount") BigDecimal executedAmount
    );

    @Modifying
    @Query(
            value = """
        INSERT INTO asset (
            user_id,
            asset_code,
            balance,
            locked_balance,
            average_buy_price
        )
        VALUES (
            :userId,
            :assetCode,
            :quantity,
            0,
            :price
        )
        ON DUPLICATE KEY UPDATE
            average_buy_price =
                (
                    asset.balance * asset.average_buy_price
                    + :quantity * :price
                )
                / (asset.balance + :quantity),
            balance = asset.balance + :quantity
        """,
            nativeQuery = true
    )
    int upsertForBuy(
            @Param("userId") Long userId,
            @Param("assetCode") String assetCode,
            @Param("quantity") BigDecimal quantity,
            @Param("price") BigDecimal price
    );

    interface AssetBalanceSnapshot {
        BigDecimal getBalance();

        BigDecimal getLockedBalance();
    }
}
