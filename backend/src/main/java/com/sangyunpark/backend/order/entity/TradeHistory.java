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
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TradeHistory extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id" , nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    private String marketCode;

    @Enumerated(EnumType.STRING)
    private TradeSide tradeSide;

    @Enumerated(EnumType.STRING)
    private OrderType orderType;

    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal price;

    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal totalAmount;

    @Builder
    private TradeHistory(
            User user,
            String marketCode,
            TradeSide tradeSide,
            OrderType orderType,
            BigDecimal quantity,
            BigDecimal price,
            BigDecimal totalAmount
    ) {
        this.user = user;
        this.marketCode = marketCode;
        this.tradeSide = tradeSide;
        this.orderType = orderType;
        this.quantity = quantity;
        this.price = price;
        this.totalAmount = totalAmount;
    }

    public static TradeHistory marketBuy(
            User user,
            String marketCode,
            BigDecimal quantity,
            BigDecimal price,
            BigDecimal totalAmount
    ) {
        return TradeHistory.builder()
                .user(user)
                .marketCode(marketCode)
                .tradeSide(TradeSide.BUY)
                .orderType(OrderType.MARKET)
                .quantity(quantity)
                .price(price)
                .totalAmount(totalAmount)
                .build();
    }

    public static TradeHistory marketSell(
            User user,
            String marketCode,
            BigDecimal quantity,
            BigDecimal price,
            BigDecimal totalAmount
    ) {
        return TradeHistory.builder()
                .user(user)
                .marketCode(marketCode)
                .tradeSide(TradeSide.SELL)
                .orderType(OrderType.MARKET)
                .quantity(quantity)
                .price(price)
                .totalAmount(totalAmount)
                .build();
    }

    public static TradeHistory limitBuy(
            User user,
            String marketCode,
            BigDecimal quantity,
            BigDecimal price,
            BigDecimal totalAmount
    ) {
        return TradeHistory.builder()
                .user(user)
                .marketCode(marketCode)
                .tradeSide(TradeSide.BUY)
                .orderType(OrderType.LIMIT)
                .quantity(quantity)
                .price(price)
                .totalAmount(totalAmount)
                .build();
    }

    public static TradeHistory limitSell(
            User user,
            String marketCode,
            BigDecimal quantity,
            BigDecimal price,
            BigDecimal totalAmount
    ) {
        return TradeHistory.builder()
                .user(user)
                .marketCode(marketCode)
                .tradeSide(TradeSide.SELL)
                .orderType(OrderType.LIMIT)
                .quantity(quantity)
                .price(price)
                .totalAmount(totalAmount)
                .build();
    }
}
