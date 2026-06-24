package com.sangyunpark.backend.order.entity;

import com.sangyunpark.backend.common.entity.BaseEntity;
import com.sangyunpark.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LimitOrder extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    private String marketCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TradeSide tradeSide;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private OrderType orderType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal limitPrice;

    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal lockedAmount;

    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal executedQuantity;

    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal executedAmount;

    @Builder
    private LimitOrder(
            User user,
            String marketCode,
            TradeSide tradeSide,
            OrderType orderType,
            OrderStatus status,
            BigDecimal quantity,
            BigDecimal limitPrice,
            BigDecimal lockedAmount,
            BigDecimal executedQuantity,
            BigDecimal executedAmount
    ) {
        this.user = user;
        this.marketCode = marketCode;
        this.tradeSide = tradeSide;
        this.orderType = orderType;
        this.status = status;
        this.quantity = quantity;
        this.limitPrice = limitPrice;
        this.lockedAmount = lockedAmount;
        this.executedQuantity = executedQuantity;
        this.executedAmount = executedAmount;
    }

    public static LimitOrder limitBuy(
            User user,
            String marketCode,
            BigDecimal quantity,
            BigDecimal limitPrice,
            BigDecimal lockedAmount
    ) {
        return LimitOrder.builder()
                .user(user)
                .marketCode(marketCode)
                .tradeSide(TradeSide.BUY)
                .orderType(OrderType.LIMIT)
                .status(OrderStatus.PENDING)
                .quantity(quantity)
                .limitPrice(limitPrice)
                .lockedAmount(lockedAmount)
                .executedQuantity(BigDecimal.ZERO)
                .executedAmount(BigDecimal.ZERO)
                .build();
    }

}
