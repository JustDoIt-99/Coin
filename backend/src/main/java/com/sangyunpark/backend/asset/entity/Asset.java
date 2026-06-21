package com.sangyunpark.backend.asset.entity;

import com.sangyunpark.backend.common.entity.BaseEntity;
import com.sangyunpark.backend.common.exception.BusinessException;
import com.sangyunpark.backend.order.exception.OrderErrorCode;
import com.sangyunpark.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "asset_code"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Asset extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "asset_code", nullable = false, length = 20)
    private String assetCode;

    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal balance;

    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal averageBuyPrice;

    @Builder
    private Asset(User user, String assetCode, BigDecimal balance, BigDecimal averageBuyPrice) {
        this.user = user;
        this.assetCode = assetCode;
        this.balance = balance;
        this.averageBuyPrice = averageBuyPrice;
    }

    public static Asset create(User user, String assetCode) {
        return Asset.builder()
                .user(user)
                .assetCode(assetCode)
                .balance(BigDecimal.ZERO)
                .averageBuyPrice(BigDecimal.ZERO)
                .build();
    }

    public static Asset createWithBalance(User user, String assetCode, BigDecimal balance) {
        return Asset.builder()
                .user(user)
                .assetCode(assetCode)
                .balance(balance)
                .averageBuyPrice(BigDecimal.ZERO)
                .build();
    }

    public void withdraw(BigDecimal amount) {
        if (balance.compareTo(amount) < 0) {
            throw new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE);
        }

        this.balance = balance.subtract(amount);
    }

    public void deposit(BigDecimal amount) {
        this.balance = balance.add(amount);
    }

    public void sell(BigDecimal quantity) {
        withdraw(quantity);

        if (balance.compareTo(BigDecimal.ZERO) == 0) {
            this.averageBuyPrice = BigDecimal.ZERO;
        }
    }

    public void buy(BigDecimal quantity, BigDecimal price) {
        if (balance.compareTo(BigDecimal.ZERO) == 0) {
            this.averageBuyPrice = price;
            this.balance = quantity;
            return;
        }

        BigDecimal previousTotalAmount = balance.multiply(averageBuyPrice);
        BigDecimal buyAmount = quantity.multiply(price);
        BigDecimal nextBalance = balance.add(quantity);

        this.averageBuyPrice = previousTotalAmount.add(buyAmount)
                .divide(nextBalance, 8, RoundingMode.HALF_UP);
        this.balance = nextBalance;
    }
}
