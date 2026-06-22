package com.sangyunpark.backend.order.service;

import com.sangyunpark.backend.asset.entity.Asset;
import com.sangyunpark.backend.asset.repository.AssetJpaRepository;
import com.sangyunpark.backend.order.entity.LimitOrder;
import com.sangyunpark.backend.order.entity.OrderStatus;
import com.sangyunpark.backend.order.entity.OrderType;
import com.sangyunpark.backend.order.entity.TradeHistory;
import com.sangyunpark.backend.order.entity.TradeSide;
import com.sangyunpark.backend.order.repository.LimitOrderJpaRepository;
import com.sangyunpark.backend.order.repository.TradeHistoryJpaRepository;
import com.sangyunpark.backend.order.service.dto.MarketPair;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LimitOrderExecutionService {

    private static final int EXECUTION_BATCH_SIZE = 100;

    private final LimitOrderJpaRepository limitOrderJpaRepository;
    private final AssetJpaRepository assetJpaRepository;
    private final TradeHistoryJpaRepository tradeHistoryJpaRepository;
    private final PendingLimitOrderIndex pendingLimitOrderIndex;

    @Transactional
    public int executePendingBuyOrders(String marketCode, BigDecimal currentPrice) {
        if (marketCode == null || marketCode.isBlank()) {
            return 0;
        }

        if (currentPrice == null || currentPrice.signum() <= 0) {
            return 0;
        }

        if (!pendingLimitOrderIndex.mayHaveExecutableBuyOrder(marketCode, currentPrice)) {
            log.debug("지정가 매수 체결 후보 조회 스킵. marketCode={}, currentPrice={}", marketCode, currentPrice);
            return 0;
        }

        List<LimitOrder> executableOrders = limitOrderJpaRepository
                .findByMarketCodeAndTradeSideAndOrderTypeAndStatusAndLimitPriceGreaterThanEqualOrderByIdAsc(
                        marketCode,
                        TradeSide.BUY,
                        OrderType.LIMIT,
                        OrderStatus.PENDING,
                        currentPrice,
                        PageRequest.of(0, EXECUTION_BATCH_SIZE)
                );

        log.debug(
                "지정가 매수 체결 후보 조회 완료. marketCode={}, currentPrice={}, count={}",
                marketCode,
                currentPrice,
                executableOrders.size()
        );

        int executedCount = 0;
        for (LimitOrder order : executableOrders) {
            if (executeBuyOrder(order, currentPrice)) {
                executedCount++;
            }
        }

        if (executedCount > 0 || executableOrders.isEmpty()) {
            pendingLimitOrderIndex.refreshBuyLimitPrice(marketCode);
        }

        return executedCount;
    }

    private boolean executeBuyOrder(LimitOrder order, BigDecimal currentPrice) {
        int claimed = limitOrderJpaRepository.updateStatus(
                order.getId(),
                OrderStatus.PENDING,
                OrderStatus.EXECUTING
        );
        if (claimed == 0) {
            return false;
        }

        MarketPair marketPair = parseMarketCode(order.getMarketCode());
        BigDecimal executedAmount = order.getQuantity().multiply(currentPrice);
        BigDecimal refundAmount = order.getLockedAmount().subtract(executedAmount);

        int used = assetJpaRepository.useLockedBalance(
                order.getUser().getId(),
                marketPair.baseAssetCode(),
                order.getLockedAmount(),
                refundAmount
        );
        if (used == 0) {
            throw new IllegalStateException("Locked balance is not enough. orderId=" + order.getId());
        }

        Asset targetAsset = assetJpaRepository
                .findForUpdateByUserAndAssetCode(order.getUser(), marketPair.targetAssetCode())
                .orElseGet(() -> Asset.create(order.getUser(), marketPair.targetAssetCode()));

        targetAsset.buy(order.getQuantity(), currentPrice);
        assetJpaRepository.save(targetAsset);
        tradeHistoryJpaRepository.save(
                TradeHistory.limitBuy(
                        order.getUser(),
                        order.getMarketCode(),
                        order.getQuantity(),
                        currentPrice,
                        executedAmount
                )
        );
        int filled = limitOrderJpaRepository.fillOrder(
                order.getId(),
                OrderStatus.EXECUTING,
                OrderStatus.FILLED,
                order.getQuantity(),
                executedAmount
        );
        if (filled == 0) {
            throw new IllegalStateException("Executing order was not filled. orderId=" + order.getId());
        }
        return true;
    }

    private MarketPair parseMarketCode(String marketCode) {
        String[] parts = marketCode.split("-");
        return new MarketPair(parts[0], parts[1]);
    }

}
