package com.sangyunpark.backend.order.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.sangyunpark.backend.order.entity.LimitOrder;
import com.sangyunpark.backend.order.entity.OrderStatus;
import com.sangyunpark.backend.order.entity.OrderType;
import com.sangyunpark.backend.order.entity.TradeSide;
import com.sangyunpark.backend.order.repository.LimitOrderJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class PendingLimitOrderIndex {

    private static final int MAXIMUM_SIZE = 2_000;
    private static final int TTL_HOURS = 24;

    private final LimitOrderJpaRepository limitOrderJpaRepository;

    private final Cache<String, Optional<BigDecimal>> maxBuyLimitPriceCache = Caffeine.newBuilder()
            .maximumSize(MAXIMUM_SIZE)
            .expireAfterWrite(Duration.ofHours(TTL_HOURS))
            .recordStats()
            .build();

    private final Cache<String, Optional<BigDecimal>> minSellLimitPriceCache = Caffeine.newBuilder()
            .maximumSize(MAXIMUM_SIZE)
            .expireAfterWrite(Duration.ofHours(TTL_HOURS))
            .recordStats()
            .build();

    public void updateBuyLimitPrice(String marketCode, BigDecimal limitPrice) {
        if (marketCode == null || marketCode.isBlank() || limitPrice == null) {
            return;
        }

        maxBuyLimitPriceCache.asMap().compute(
                marketCode,
                (key, currentMaxLimitPrice) -> {
                    if (currentMaxLimitPrice == null || currentMaxLimitPrice.isEmpty()) {
                        return Optional.of(limitPrice);
                    }

                    return Optional.of(currentMaxLimitPrice.get().max(limitPrice));
                }
        );
    }

    public void updateSellLimitPrice(String marketCode, BigDecimal limitPrice) {
        if (marketCode == null || marketCode.isBlank() || limitPrice == null) {
            return;
        }

        minSellLimitPriceCache.asMap().compute(
                marketCode,
                (key, currentMinLimitPrice) -> {
                    if (currentMinLimitPrice == null || currentMinLimitPrice.isEmpty()) {
                        return Optional.of(limitPrice);
                    }

                    return Optional.of(currentMinLimitPrice.get().min(limitPrice));
                }
        );
    }

    public boolean mayHaveExecutableBuyOrder(String marketCode, BigDecimal currentPrice) {
        if (marketCode == null || marketCode.isBlank() || currentPrice == null) {
            return false;
        }

        Optional<BigDecimal> maxBuyLimitPrice = maxBuyLimitPriceCache.getIfPresent(marketCode);
        if (maxBuyLimitPrice == null) {
            return true;
        }

        if (maxBuyLimitPrice.isEmpty()) {
            return false;
        }

        return currentPrice.compareTo(maxBuyLimitPrice.get()) <= 0;
    }

    public boolean mayHaveExecutableSellOrder(String marketCode, BigDecimal currentPrice) {
        if (marketCode == null || marketCode.isBlank() || currentPrice == null) {
            return false;
        }

        Optional<BigDecimal> minSellLimitPrice = minSellLimitPriceCache.getIfPresent(marketCode);
        if (minSellLimitPrice == null) {
            return true;
        }

        if (minSellLimitPrice.isEmpty()) {
            return false;
        }

        return currentPrice.compareTo(minSellLimitPrice.get()) >= 0;
    }

    public void refreshBuyLimitPrice(String marketCode) {
        if (marketCode == null || marketCode.isBlank()) {
            return;
        }

        Optional<BigDecimal> maxLimitPrice = limitOrderJpaRepository
                .findHighestPendingBuyLimitOrder(marketCode)
                .map(LimitOrder::getLimitPrice);

        maxBuyLimitPriceCache.put(marketCode, maxLimitPrice);
    }

    public void refreshSellLimitPrice(String marketCode) {
        if (marketCode == null || marketCode.isBlank()) {
            return;
        }

        Optional<BigDecimal> minLimitPrice = limitOrderJpaRepository
                .findLowestPendingSellLimitOrder(marketCode)
                .map(LimitOrder::getLimitPrice);

        minSellLimitPriceCache.put(marketCode, minLimitPrice);
    }

    public void refreshLimitPrice(String marketCode, TradeSide tradeSide) {
        if (tradeSide == TradeSide.BUY) {
            refreshBuyLimitPrice(marketCode);
            return;
        }

        if (tradeSide == TradeSide.SELL) {
            refreshSellLimitPrice(marketCode);
        }
    }

    public void clear() {
        maxBuyLimitPriceCache.invalidateAll();
        minSellLimitPriceCache.invalidateAll();
    }
}
