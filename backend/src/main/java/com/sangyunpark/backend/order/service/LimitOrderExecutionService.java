package com.sangyunpark.backend.order.service;

import com.sangyunpark.backend.asset.entity.Asset;
import com.sangyunpark.backend.asset.entity.AssetTransactionReferenceType;
import com.sangyunpark.backend.asset.entity.AssetTransactionType;
import com.sangyunpark.backend.asset.repository.AssetJpaRepository;
import com.sangyunpark.backend.asset.service.AssetTransactionRecorder;
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
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LimitOrderExecutionService {

    private static final int EXECUTION_BATCH_SIZE = 100;
    private static final int EXECUTION_RETRY_BATCH_SIZE = 100;
    private static final int EXECUTION_RETRY_SCHEDULE_DELAY_MILLIS = 500;
    private static final Duration EXECUTION_RETRY_BACKOFF = Duration.ofMillis(500);

    private final LimitOrderJpaRepository limitOrderJpaRepository;
    private final AssetJpaRepository assetJpaRepository;
    private final TradeHistoryJpaRepository tradeHistoryJpaRepository;
    private final PendingLimitOrderIndex pendingLimitOrderIndex;
    private final TransactionTemplate transactionTemplate;
    private final AssetTransactionRecorder assetTransactionRecorder;

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
        boolean shouldRefreshIndex = executableOrders.isEmpty();
        for (LimitOrder order : executableOrders) {
            try {
                Boolean executed = transactionTemplate.execute(status -> executeBuyOrder(order, currentPrice));
                if (Boolean.TRUE.equals(executed)) {
                    executedCount++;
                    shouldRefreshIndex = true;
                }
            } catch (Exception e) {
                log.error("지정가 매수 주문 체결 실패. orderId={}, marketCode={}", order.getId(), order.getMarketCode(), e);
                if (markOrderExecutionRetryPending(order)) {
                    shouldRefreshIndex = true;
                }
            }
        }

        if (shouldRefreshIndex) {
            pendingLimitOrderIndex.refreshBuyLimitPrice(marketCode);
        }

        return executedCount;
    }

    public int executePendingSellOrders(String marketCode, BigDecimal currentPrice) {
        if (marketCode == null || marketCode.isBlank()) {
            return 0;
        }

        if (currentPrice == null || currentPrice.signum() <= 0) {
            return 0;
        }

        if (!pendingLimitOrderIndex.mayHaveExecutableSellOrder(marketCode, currentPrice)) {
            log.debug("지정가 매도 체결 후보 조회 스킵. marketCode={}, currentPrice={}", marketCode, currentPrice);
            return 0;
        }

        List<LimitOrder> executableOrders = limitOrderJpaRepository
                .findByMarketCodeAndTradeSideAndOrderTypeAndStatusAndLimitPriceLessThanEqualOrderByIdAsc(
                        marketCode,
                        TradeSide.SELL,
                        OrderType.LIMIT,
                        OrderStatus.PENDING,
                        currentPrice,
                        PageRequest.of(0, EXECUTION_BATCH_SIZE)
                );

        log.debug(
                "지정가 매도 체결 후보 조회 완료. marketCode={}, currentPrice={}, count={}",
                marketCode,
                currentPrice,
                executableOrders.size()
        );

        int executedCount = 0;
        boolean shouldRefreshIndex = executableOrders.isEmpty();
        for (LimitOrder order : executableOrders) {
            try {
                Boolean executed = transactionTemplate.execute(status -> executeSellOrder(order, currentPrice));
                if (Boolean.TRUE.equals(executed)) {
                    executedCount++;
                    shouldRefreshIndex = true;
                }
            } catch (Exception e) {
                log.error("지정가 매도 주문 체결 실패. orderId={}, marketCode={}", order.getId(), order.getMarketCode(), e);
                if (markOrderExecutionRetryPending(order)) {
                    shouldRefreshIndex = true;
                }
            }
        }

        if (shouldRefreshIndex) {
            pendingLimitOrderIndex.refreshSellLimitPrice(marketCode);
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
            throw new IllegalStateException("잠긴 잔액이 부족합니다. orderId=" + order.getId());
        }

        Asset targetAsset = assetJpaRepository
                .findForUpdateByUserAndAssetCode(order.getUser(), marketPair.targetAssetCode())
                .orElseGet(() -> Asset.create(order.getUser(), marketPair.targetAssetCode()));

        targetAsset.buy(order.getQuantity(), currentPrice);
        assetJpaRepository.save(targetAsset);
        TradeHistory tradeHistory = tradeHistoryJpaRepository.save(
                TradeHistory.limitBuy(
                        order.getUser(),
                        order.getMarketCode(),
                        order.getQuantity(),
                        currentPrice,
                        executedAmount
                )
        );
        assetTransactionRecorder.recordCurrentBalance(
                order.getUser(),
                marketPair.baseAssetCode(),
                AssetTransactionType.USE_LOCKED,
                executedAmount,
                AssetTransactionReferenceType.TRADE,
                tradeHistory.getId()
        );
        assetTransactionRecorder.recordCurrentBalance(
                order.getUser(),
                marketPair.baseAssetCode(),
                AssetTransactionType.REFUND,
                refundAmount,
                AssetTransactionReferenceType.TRADE,
                tradeHistory.getId()
        );
        assetTransactionRecorder.record(
                targetAsset,
                AssetTransactionType.BUY,
                order.getQuantity(),
                AssetTransactionReferenceType.TRADE,
                tradeHistory.getId()
        );
        int filled = limitOrderJpaRepository.fillOrder(
                order.getId(),
                OrderStatus.EXECUTING,
                OrderStatus.FILLED,
                order.getQuantity(),
                executedAmount
        );
        if (filled == 0) {
            throw new IllegalStateException("체결 진행 중인 주문을 체결 완료 처리하지 못했습니다. orderId=" + order.getId());
        }
        return true;
    }

    private boolean executeSellOrder(LimitOrder order, BigDecimal currentPrice) {
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

        Asset baseAsset = assetJpaRepository
                .findForUpdateByUserAndAssetCode(order.getUser(), marketPair.baseAssetCode())
                .orElseGet(() -> Asset.create(order.getUser(), marketPair.baseAssetCode()));

        int used = assetJpaRepository.useLockedBalance(
                order.getUser().getId(),
                marketPair.targetAssetCode(),
                order.getLockedAmount(),
                BigDecimal.ZERO
        );
        if (used == 0) {
            throw new IllegalStateException("잠긴 매도 수량이 부족합니다. orderId=" + order.getId());
        }

        baseAsset.deposit(executedAmount);
        assetJpaRepository.save(baseAsset);
        TradeHistory tradeHistory = tradeHistoryJpaRepository.save(
                TradeHistory.limitSell(
                        order.getUser(),
                        order.getMarketCode(),
                        order.getQuantity(),
                        currentPrice,
                        executedAmount
                )
        );
        assetTransactionRecorder.recordCurrentBalance(
                order.getUser(),
                marketPair.targetAssetCode(),
                AssetTransactionType.USE_LOCKED,
                order.getLockedAmount(),
                AssetTransactionReferenceType.TRADE,
                tradeHistory.getId()
        );
        assetTransactionRecorder.record(
                baseAsset,
                AssetTransactionType.DEPOSIT,
                executedAmount,
                AssetTransactionReferenceType.TRADE,
                tradeHistory.getId()
        );
        int filled = limitOrderJpaRepository.fillOrder(
                order.getId(),
                OrderStatus.EXECUTING,
                OrderStatus.FILLED,
                order.getQuantity(),
                executedAmount
        );
        if (filled == 0) {
            throw new IllegalStateException("체결 진행 중인 매도 주문을 체결 완료 처리하지 못했습니다. orderId=" + order.getId());
        }
        return true;
    }

    private boolean markOrderExecutionRetryPending(LimitOrder order) {
        Boolean markedRetryPending = transactionTemplate.execute(status -> {
            int updated = limitOrderJpaRepository.updateStatus(
                    order.getId(),
                    OrderStatus.PENDING,
                    OrderStatus.EXECUTION_RETRY_PENDING
            );
            return updated > 0;
        });

        return Boolean.TRUE.equals(markedRetryPending);
    }

    @Scheduled(fixedDelay = EXECUTION_RETRY_SCHEDULE_DELAY_MILLIS)
    public void retryExecutionRetryPendingOrders() {
        LocalDateTime retryBefore = LocalDateTime.now().minus(EXECUTION_RETRY_BACKOFF);
        List<LimitOrder> orders = limitOrderJpaRepository.findByStatusAndUpdatedAtLessThanEqualOrderByIdAsc(
                OrderStatus.EXECUTION_RETRY_PENDING,
                retryBefore,
                PageRequest.of(0, EXECUTION_RETRY_BATCH_SIZE)
        );

        for (LimitOrder order : orders) {
            Boolean restored = transactionTemplate.execute(status -> {
                int updated = limitOrderJpaRepository.updateStatus(
                        order.getId(),
                        OrderStatus.EXECUTION_RETRY_PENDING,
                        OrderStatus.PENDING
                );
                return updated > 0;
            });

            if (Boolean.TRUE.equals(restored)) {
                if (order.getTradeSide() == TradeSide.BUY) {
                    pendingLimitOrderIndex.updateBuyLimitPrice(order.getMarketCode(), order.getLimitPrice());
                } else if (order.getTradeSide() == TradeSide.SELL) {
                    pendingLimitOrderIndex.updateSellLimitPrice(order.getMarketCode(), order.getLimitPrice());
                }
            }
        }
    }

    private MarketPair parseMarketCode(String marketCode) {
        String[] parts = marketCode.split("-");
        return new MarketPair(parts[0], parts[1]);
    }

}
