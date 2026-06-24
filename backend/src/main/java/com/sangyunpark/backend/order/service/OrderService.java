package com.sangyunpark.backend.order.service;

import com.sangyunpark.backend.asset.entity.Asset;
import com.sangyunpark.backend.asset.repository.AssetJpaRepository;
import com.sangyunpark.backend.auth.exception.AuthErrorCode;
import com.sangyunpark.backend.common.exception.BusinessException;
import com.sangyunpark.backend.market.price.UpbitMarketPriceProvider;
import com.sangyunpark.backend.order.controller.dto.request.LimitBuyRequest;
import com.sangyunpark.backend.order.controller.dto.request.MarketBuyRequest;
import com.sangyunpark.backend.order.controller.dto.request.MarketSellRequest;
import com.sangyunpark.backend.order.controller.dto.response.CancelLimitOrderResponse;
import com.sangyunpark.backend.order.controller.dto.response.LimitBuyResponse;
import com.sangyunpark.backend.order.controller.dto.response.MarketBuyResponse;
import com.sangyunpark.backend.order.controller.dto.response.MarketSellResponse;
import com.sangyunpark.backend.order.controller.dto.response.TradeHistoryCursorResponse;
import com.sangyunpark.backend.order.controller.dto.response.TradeHistoryResponse;
import com.sangyunpark.backend.order.entity.LimitOrder;
import com.sangyunpark.backend.order.entity.OrderStatus;
import com.sangyunpark.backend.order.entity.TradeHistory;
import com.sangyunpark.backend.order.event.LimitBuyOrderCreatedEvent;
import com.sangyunpark.backend.order.event.LimitOrderCancelledEvent;
import com.sangyunpark.backend.order.exception.OrderErrorCode;
import com.sangyunpark.backend.order.repository.LimitOrderJpaRepository;
import com.sangyunpark.backend.order.repository.TradeHistoryJpaRepository;
import com.sangyunpark.backend.order.service.dto.MarketPair;
import com.sangyunpark.backend.user.entity.User;
import com.sangyunpark.backend.user.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final int QUANTITY_SCALE = 8;
    private static final int MAX_TRADE_HISTORY_SIZE = 100;
    private static final BigDecimal MIN_EXECUTED_QUANTITY = new BigDecimal("0.00000001");

    private final UserJpaRepository userJpaRepository;
    private final AssetJpaRepository assetJpaRepository;
    private final UpbitMarketPriceProvider upbitMarketPriceProvider;
    private final TradeHistoryJpaRepository tradeHistoryJpaRepository;
    private final LimitOrderJpaRepository limitOrderJpaRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public MarketBuyResponse marketBuy(Long userId, MarketBuyRequest request) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        BigDecimal orderAmount = request.amount();
        MarketPair marketPair = parseMarketCode(request.marketCode());

        Asset baseAsset = assetJpaRepository.findForUpdateByUserAndAssetCode(user, marketPair.baseAssetCode())
                .orElseThrow(() -> new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE));

        if (baseAsset.getBalance().compareTo(orderAmount) < 0) {
            throw new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE);
        }

        BigDecimal currentPrice = upbitMarketPriceProvider.getCurrentPrice(request.marketCode());
        validateCurrentPrice(currentPrice);

        BigDecimal executedQuantity = calculateExecutedQuantity(orderAmount, currentPrice);

        if (executedQuantity.compareTo(MIN_EXECUTED_QUANTITY) < 0) {
            throw new BusinessException(OrderErrorCode.ORDER_AMOUNT_TOO_SMALL);
        }

        BigDecimal executedAmount = executedQuantity.multiply(currentPrice);

        Asset targetAsset = assetJpaRepository.findForUpdateByUserAndAssetCode(user, marketPair.targetAssetCode())
                .orElseGet(() -> Asset.create(user, marketPair.targetAssetCode()));

        baseAsset.withdraw(executedAmount);
        targetAsset.buy(executedQuantity, currentPrice);
        assetJpaRepository.save(targetAsset);

        TradeHistory tradeHistory = tradeHistoryJpaRepository.save(
                TradeHistory.marketBuy(
                        user,
                        request.marketCode(),
                        executedQuantity,
                        currentPrice,
                        executedAmount
                )
        );

        return new MarketBuyResponse(
                tradeHistory.getId(),
                request.marketCode(),
                orderAmount,
                executedAmount,
                currentPrice,
                executedQuantity,
                baseAsset.getBalance(),
                targetAsset.getBalance(),
                targetAsset.getAverageBuyPrice()
        );
    }

    @Transactional
    public MarketSellResponse marketSell(Long userId, MarketSellRequest request) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        BigDecimal orderQuantity = request.quantity();
        MarketPair marketPair = parseMarketCode(request.marketCode());

        Asset baseAsset = assetJpaRepository.findForUpdateByUserAndAssetCode(user, marketPair.baseAssetCode())
                .orElseGet(() -> Asset.create(user, marketPair.baseAssetCode()));

        Asset targetAsset = assetJpaRepository.findForUpdateByUserAndAssetCode(user, marketPair.targetAssetCode())
                .orElseThrow(() -> new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE));

        if (targetAsset.getBalance().compareTo(orderQuantity) < 0) {
            throw new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE);
        }

        BigDecimal currentPrice = upbitMarketPriceProvider.getCurrentPrice(request.marketCode());
        validateCurrentPrice(currentPrice);

        BigDecimal executedAmount = orderQuantity.multiply(currentPrice);

        targetAsset.sell(orderQuantity);
        baseAsset.deposit(executedAmount);
        assetJpaRepository.save(baseAsset);

        TradeHistory tradeHistory = tradeHistoryJpaRepository.save(
                TradeHistory.marketSell(
                        user,
                        request.marketCode(),
                        orderQuantity,
                        currentPrice,
                        executedAmount
                )
        );

        return new MarketSellResponse(
                tradeHistory.getId(),
                request.marketCode(),
                orderQuantity,
                executedAmount,
                currentPrice,
                orderQuantity,
                baseAsset.getBalance(),
                targetAsset.getBalance(),
                targetAsset.getAverageBuyPrice()
        );
    }

    @Transactional
    public LimitBuyResponse limitBuy(Long userId, LimitBuyRequest request) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        MarketPair marketPair = parseMarketCode(request.marketCode());
        BigDecimal lockedAmount = request.quantity().multiply(request.limitPrice());

        if (lockedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(OrderErrorCode.ORDER_AMOUNT_TOO_SMALL);
        }

        int locked = assetJpaRepository.lockBalance(user.getId(), marketPair.baseAssetCode(), lockedAmount);
        if (locked == 0) {
            throw new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE);
        }

        LimitOrder order = limitOrderJpaRepository.save(
                LimitOrder.limitBuy(
                        user,
                        request.marketCode(),
                        request.quantity(),
                        request.limitPrice(),
                        lockedAmount
                )
        );
        eventPublisher.publishEvent(new LimitBuyOrderCreatedEvent(order.getMarketCode(), order.getLimitPrice()));

        return LimitBuyResponse.from(order);
    }

    @Transactional
    public CancelLimitOrderResponse cancelLimitOrder(Long userId, Long orderId) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        LimitOrder order = limitOrderJpaRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new BusinessException(OrderErrorCode.ORDER_NOT_FOUND));

        MarketPair marketPair = parseMarketCode(order.getMarketCode());

        int cancelled = limitOrderJpaRepository.updateStatusByUserId(
                order.getId(),
                user.getId(),
                OrderStatus.PENDING,
                OrderStatus.CANCELLED
        );
        if (cancelled == 0) {
            throw new BusinessException(OrderErrorCode.ORDER_NOT_CANCELABLE);
        }

        int released = assetJpaRepository.releaseLockedBalance(
                user.getId(),
                marketPair.baseAssetCode(),
                order.getLockedAmount()
        );
        if (released == 0) {
            throw new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE);
        }
        eventPublisher.publishEvent(new LimitOrderCancelledEvent(order.getMarketCode()));

        return CancelLimitOrderResponse.of(
                order,
                order.getLockedAmount(),
                OrderStatus.CANCELLED
        );
    }

    @Transactional(readOnly = true)
    public TradeHistoryCursorResponse getTradeHistories(Long userId, Long cursorId, int size) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        int limit = Math.max(1, Math.min(size, MAX_TRADE_HISTORY_SIZE));
        List<TradeHistory> tradeHistories = findTradeHistories(user, cursorId, limit + 1);
        boolean hasNext = tradeHistories.size() > limit;
        List<TradeHistoryResponse> items = tradeHistories.stream()
                .limit(limit)
                .map(TradeHistoryResponse::from)
                .toList();
        Long nextCursorId = hasNext ? items.get(items.size() - 1).id() : null;

        return new TradeHistoryCursorResponse(items, nextCursorId, hasNext);
    }

    private List<TradeHistory> findTradeHistories(User user, Long cursorId, int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit);

        if (cursorId == null) {
            return tradeHistoryJpaRepository.findByUserOrderByIdDesc(user, pageRequest);
        }

        return tradeHistoryJpaRepository.findByUserAndIdLessThanOrderByIdDesc(user, cursorId, pageRequest);
    }

    private MarketPair parseMarketCode(String marketCode) {
        String[] parts = marketCode.split("-");

        if (parts.length != 2 || parts[0].isBlank() || parts[1].isBlank()) {
            throw new BusinessException(OrderErrorCode.INVALID_MARKET_CODE);
        }

        return new MarketPair(parts[0], parts[1]);
    }

    private BigDecimal calculateExecutedQuantity(BigDecimal orderAmount, BigDecimal currentPrice) {
        return orderAmount.divide(currentPrice, QUANTITY_SCALE, RoundingMode.DOWN);
    }

    private void validateCurrentPrice(BigDecimal currentPrice) {
        if (currentPrice == null || currentPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(OrderErrorCode.INVALID_MARKET_PRICE);
        }
    }

}
