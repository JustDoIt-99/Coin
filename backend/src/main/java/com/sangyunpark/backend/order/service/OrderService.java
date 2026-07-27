package com.sangyunpark.backend.order.service;

import com.sangyunpark.backend.asset.entity.Asset;
import com.sangyunpark.backend.asset.entity.AssetTransactionReferenceType;
import com.sangyunpark.backend.asset.entity.AssetTransactionType;
import com.sangyunpark.backend.asset.event.AssetUpdatedEvent;
import com.sangyunpark.backend.asset.repository.AssetJpaRepository;
import com.sangyunpark.backend.asset.service.AssetTransactionRecorder;
import com.sangyunpark.backend.auth.exception.AuthErrorCode;
import com.sangyunpark.backend.common.exception.BusinessException;
import com.sangyunpark.backend.market.dto.response.OrderbookResponse;
import com.sangyunpark.backend.market.restClient.UpbitOrderbookClient;
import com.sangyunpark.backend.order.controller.dto.request.LimitBuyRequest;
import com.sangyunpark.backend.order.controller.dto.request.LimitSellRequest;
import com.sangyunpark.backend.order.controller.dto.request.MarketBuyRequest;
import com.sangyunpark.backend.order.controller.dto.request.MarketSellRequest;
import com.sangyunpark.backend.order.controller.dto.response.CancelLimitOrderResponse;
import com.sangyunpark.backend.order.controller.dto.response.LimitBuyResponse;
import com.sangyunpark.backend.order.controller.dto.response.LimitSellResponse;
import com.sangyunpark.backend.order.controller.dto.response.MarketBuyResponse;
import com.sangyunpark.backend.order.controller.dto.response.MarketSellResponse;
import com.sangyunpark.backend.order.controller.dto.response.PendingLimitOrderResponse;
import com.sangyunpark.backend.order.controller.dto.response.TradeHistoryCursorResponse;
import com.sangyunpark.backend.order.controller.dto.response.TradeHistoryResponse;
import com.sangyunpark.backend.order.entity.LimitOrder;
import com.sangyunpark.backend.order.entity.OrderStatus;
import com.sangyunpark.backend.order.entity.OrderType;
import com.sangyunpark.backend.order.entity.TradeHistory;
import com.sangyunpark.backend.order.entity.TradeSide;
import com.sangyunpark.backend.order.event.LimitBuyOrderCreatedEvent;
import com.sangyunpark.backend.order.event.LimitOrderCancelledEvent;
import com.sangyunpark.backend.order.event.LimitSellOrderCreatedEvent;
import com.sangyunpark.backend.order.event.TradeExecutedEvent;
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
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final int QUANTITY_SCALE = 8;
    private static final int MAX_TRADE_HISTORY_SIZE = 100;
    private static final BigDecimal MIN_MARKET_BUY_AMOUNT = new BigDecimal("5000");
    private static final BigDecimal MIN_EXECUTED_QUANTITY = new BigDecimal("0.00000001");

    private final UserJpaRepository userJpaRepository;
    private final AssetJpaRepository assetJpaRepository;
    private final UpbitOrderbookClient upbitOrderbookClient;
    private final TradeHistoryJpaRepository tradeHistoryJpaRepository;
    private final LimitOrderJpaRepository limitOrderJpaRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final AssetTransactionRecorder assetTransactionRecorder;
    private final TransactionTemplate transactionTemplate;

    public MarketBuyResponse marketBuy(Long userId, MarketBuyRequest request) {
        BigDecimal orderAmount = request.amount();
        MarketPair marketPair = parseMarketCode(request.marketCode());

        if (orderAmount.compareTo(MIN_MARKET_BUY_AMOUNT) < 0) {
            throw new BusinessException(OrderErrorCode.ORDER_AMOUNT_TOO_SMALL);
        }

        validateMarketBuyBalance(userId, marketPair.baseAssetCode(), orderAmount);

        MarketOrderExecution execution = calculateMarketBuyExecution(request.marketCode(), orderAmount);
        BigDecimal executedQuantity = execution.executedQuantity();

        if (executedQuantity.compareTo(MIN_EXECUTED_QUANTITY) < 0) {
            throw new BusinessException(OrderErrorCode.ORDER_AMOUNT_TOO_SMALL);
        }

        return transactionTemplate.execute(status -> executeMarketBuy(
                userId,
                request,
                orderAmount,
                marketPair,
                execution
        ));
    }

    private void validateMarketBuyBalance(Long userId, String baseAssetCode, BigDecimal orderAmount) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        Asset baseAsset = assetJpaRepository.findByUserAndAssetCode(user, baseAssetCode)
                .orElseThrow(() -> new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE));

        if (baseAsset.getBalance().compareTo(orderAmount) < 0) {
            throw new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE);
        }
    }

    private MarketBuyResponse executeMarketBuy(
            Long userId,
            MarketBuyRequest request,
            BigDecimal orderAmount,
            MarketPair marketPair,
            MarketOrderExecution execution
    ) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        Asset baseAsset = assetJpaRepository.findForUpdateByUserAndAssetCode(user, marketPair.baseAssetCode())
                .orElseThrow(() -> new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE));

        if (baseAsset.getBalance().compareTo(orderAmount) < 0) {
            throw new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE);
        }

        BigDecimal executedQuantity = execution.executedQuantity();
        BigDecimal executedAmount = execution.executedAmount();
        BigDecimal executedPrice = execution.averageExecutedPrice();

        Asset targetAsset = assetJpaRepository.findForUpdateByUserAndAssetCode(user, marketPair.targetAssetCode())
                .orElseGet(() -> Asset.create(user, marketPair.targetAssetCode()));

        baseAsset.withdraw(executedAmount);
        targetAsset.buy(executedQuantity, executedPrice);
        assetJpaRepository.save(targetAsset);

        TradeHistory tradeHistory = tradeHistoryJpaRepository.save(
                TradeHistory.marketBuy(
                        user,
                        request.marketCode(),
                        executedQuantity,
                        executedPrice,
                        executedAmount
                )
        );
        assetTransactionRecorder.record(
                baseAsset,
                AssetTransactionType.WITHDRAW,
                executedAmount,
                AssetTransactionReferenceType.TRADE,
                tradeHistory.getId()
        );
        assetTransactionRecorder.record(
                targetAsset,
                AssetTransactionType.BUY,
                executedQuantity,
                AssetTransactionReferenceType.TRADE,
                tradeHistory.getId()
        );
        publishAssetUpdated(user, List.of(marketPair.baseAssetCode(), marketPair.targetAssetCode()), "MARKET_BUY");
        publishTradeExecuted(tradeHistory);

        return new MarketBuyResponse(
                tradeHistory.getId(),
                request.marketCode(),
                orderAmount,
                executedAmount,
                executedPrice,
                executedQuantity,
                baseAsset.getBalance(),
                targetAsset.getBalance(),
                targetAsset.getAverageBuyPrice()
        );
    }

    public MarketSellResponse marketSell(Long userId, MarketSellRequest request) {
        BigDecimal orderQuantity = request.quantity();
        MarketPair marketPair = parseMarketCode(request.marketCode());

        validateMarketSellBalance(userId, marketPair.targetAssetCode(), orderQuantity);

        MarketOrderExecution execution = calculateMarketSellExecution(request.marketCode(), orderQuantity);

        return transactionTemplate.execute(status -> executeMarketSell(
                userId,
                request,
                orderQuantity,
                marketPair,
                execution
        ));
    }

    private void validateMarketSellBalance(Long userId, String targetAssetCode, BigDecimal orderQuantity) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        Asset targetAsset = assetJpaRepository.findByUserAndAssetCode(user, targetAssetCode)
                .orElseThrow(() -> new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE));

        if (targetAsset.getBalance().compareTo(orderQuantity) < 0) {
            throw new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE);
        }
    }

    private MarketSellResponse executeMarketSell(
            Long userId,
            MarketSellRequest request,
            BigDecimal orderQuantity,
            MarketPair marketPair,
            MarketOrderExecution execution
    ) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        Asset baseAsset = assetJpaRepository.findForUpdateByUserAndAssetCode(user, marketPair.baseAssetCode())
                .orElseGet(() -> Asset.create(user, marketPair.baseAssetCode()));

        Asset targetAsset = assetJpaRepository.findForUpdateByUserAndAssetCode(user, marketPair.targetAssetCode())
                .orElseThrow(() -> new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE));

        if (targetAsset.getBalance().compareTo(orderQuantity) < 0) {
            throw new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE);
        }

        BigDecimal executedAmount = execution.executedAmount();
        BigDecimal executedPrice = execution.averageExecutedPrice();

        targetAsset.sell(orderQuantity);
        baseAsset.deposit(executedAmount);
        assetJpaRepository.save(baseAsset);

        TradeHistory tradeHistory = tradeHistoryJpaRepository.save(
                TradeHistory.marketSell(
                        user,
                        request.marketCode(),
                        orderQuantity,
                        executedPrice,
                        executedAmount
                )
        );
        assetTransactionRecorder.record(
                targetAsset,
                AssetTransactionType.SELL,
                orderQuantity,
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
        publishAssetUpdated(user, List.of(marketPair.baseAssetCode(), marketPair.targetAssetCode()), "MARKET_SELL");
        publishTradeExecuted(tradeHistory);

        return new MarketSellResponse(
                tradeHistory.getId(),
                request.marketCode(),
                orderQuantity,
                executedAmount,
                executedPrice,
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
        validateLimitOrder(request.quantity(), request.limitPrice());
        BigDecimal lockedAmount = request.quantity().multiply(request.limitPrice());

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
        assetTransactionRecorder.recordCurrentBalance(
                user,
                marketPair.baseAssetCode(),
                AssetTransactionType.LOCK,
                lockedAmount,
                AssetTransactionReferenceType.ORDER,
                order.getId()
        );
        eventPublisher.publishEvent(new LimitBuyOrderCreatedEvent(order.getMarketCode(), order.getLimitPrice()));
        publishAssetUpdated(user, List.of(marketPair.baseAssetCode()), "LIMIT_BUY_CREATED");

        return LimitBuyResponse.from(order);
    }

    @Transactional
    public LimitSellResponse limitSell(Long userId, LimitSellRequest request) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        MarketPair marketPair = parseMarketCode(request.marketCode());
        validateLimitOrder(request.quantity(), request.limitPrice());
        BigDecimal lockedAmount = request.quantity();

        int locked = assetJpaRepository.lockBalance(user.getId(), marketPair.targetAssetCode(), lockedAmount);
        if (locked == 0) {
            throw new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE);
        }

        LimitOrder order = limitOrderJpaRepository.save(
                LimitOrder.limitSell(
                        user,
                        request.marketCode(),
                        request.quantity(),
                        request.limitPrice(),
                        lockedAmount
                )
        );
        assetTransactionRecorder.recordCurrentBalance(
                user,
                marketPair.targetAssetCode(),
                AssetTransactionType.LOCK,
                lockedAmount,
                AssetTransactionReferenceType.ORDER,
                order.getId()
        );
        eventPublisher.publishEvent(new LimitSellOrderCreatedEvent(order.getMarketCode(), order.getLimitPrice()));
        publishAssetUpdated(user, List.of(marketPair.targetAssetCode()), "LIMIT_SELL_CREATED");

        return LimitSellResponse.from(order);
    }

    @Transactional
    public CancelLimitOrderResponse cancelLimitOrder(Long userId, Long orderId) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        LimitOrder order = limitOrderJpaRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new BusinessException(OrderErrorCode.ORDER_NOT_FOUND));

        MarketPair marketPair = parseMarketCode(order.getMarketCode());

        int cancelled = limitOrderJpaRepository.updateStatusByUserIdInStatuses(
                order.getId(),
                user.getId(),
                List.of(OrderStatus.PENDING, OrderStatus.EXECUTION_RETRY_PENDING),
                OrderStatus.CANCELLED
        );
        if (cancelled == 0) {
            throw new BusinessException(OrderErrorCode.ORDER_NOT_CANCELABLE);
        }

        String lockedAssetCode = order.getTradeSide() == TradeSide.BUY
                ? marketPair.baseAssetCode()
                : marketPair.targetAssetCode();

        int released = assetJpaRepository.releaseLockedBalance(
                user.getId(),
                lockedAssetCode,
                order.getLockedAmount()
        );
        if (released == 0) {
            throw new BusinessException(OrderErrorCode.INSUFFICIENT_BALANCE);
        }
        assetTransactionRecorder.recordCurrentBalance(
                user,
                lockedAssetCode,
                AssetTransactionType.RELEASE,
                order.getLockedAmount(),
                AssetTransactionReferenceType.ORDER,
                order.getId()
        );
        eventPublisher.publishEvent(new LimitOrderCancelledEvent(order.getMarketCode(), order.getTradeSide()));
        publishAssetUpdated(user, List.of(lockedAssetCode), "LIMIT_ORDER_CANCELLED");

        return CancelLimitOrderResponse.of(
                order,
                order.getLockedAmount(),
                OrderStatus.CANCELLED
        );
    }

    @Transactional(readOnly = true)
    public List<PendingLimitOrderResponse> getPendingLimitOrders(Long userId) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        return limitOrderJpaRepository
                .findByUserAndOrderTypeAndStatusInOrderByIdDesc(
                        user,
                        OrderType.LIMIT,
                        List.of(OrderStatus.PENDING, OrderStatus.EXECUTION_RETRY_PENDING)
                )
                .stream()
                .map(PendingLimitOrderResponse::from)
                .toList();
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

    private void publishAssetUpdated(User user, List<String> assetCodes, String reason) {
        eventPublisher.publishEvent(new AssetUpdatedEvent(user.getId(), assetCodes, reason));
    }

    private void publishTradeExecuted(TradeHistory tradeHistory) {
        eventPublisher.publishEvent(TradeExecutedEvent.from(tradeHistory));
    }

    private MarketPair parseMarketCode(String marketCode) {
        String[] parts = marketCode.split("-");

        if (parts.length != 2 || parts[0].isBlank() || parts[1].isBlank()) {
            throw new BusinessException(OrderErrorCode.INVALID_MARKET_CODE);
        }

        return new MarketPair(parts[0], parts[1]);
    }

    private MarketOrderExecution calculateMarketBuyExecution(String marketCode, BigDecimal orderAmount) {
        OrderbookResponse orderbook = upbitOrderbookClient.fetchOrderbook(marketCode);
        if (orderbook.orderbookUnits() == null || orderbook.orderbookUnits().isEmpty()) {
            throw new BusinessException(OrderErrorCode.INSUFFICIENT_MARKET_LIQUIDITY);
        }

        BigDecimal remainingAmount = orderAmount;
        BigDecimal executedAmount = BigDecimal.ZERO;
        BigDecimal executedQuantity = BigDecimal.ZERO;

        for (OrderbookResponse.OrderBookUnitResponse unit : orderbook.orderbookUnits()) {
            BigDecimal askPrice = unit.askPrice();
            BigDecimal askSize = unit.askSize();
            validateCurrentPrice(askPrice);

            if (askSize == null || askSize.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            BigDecimal levelAmount = askPrice.multiply(askSize);
            if (remainingAmount.compareTo(levelAmount) >= 0) {
                executedAmount = executedAmount.add(levelAmount);
                executedQuantity = executedQuantity.add(askSize);
                remainingAmount = remainingAmount.subtract(levelAmount);
                continue;
            }

            BigDecimal partialQuantity = remainingAmount.divide(askPrice, QUANTITY_SCALE, RoundingMode.DOWN);
            if (partialQuantity.compareTo(BigDecimal.ZERO) <= 0) {
                if (executedQuantity.compareTo(BigDecimal.ZERO) > 0) {
                    remainingAmount = BigDecimal.ZERO;
                }
                break;
            }

            BigDecimal partialAmount = partialQuantity.multiply(askPrice);
            executedAmount = executedAmount.add(partialAmount);
            executedQuantity = executedQuantity.add(partialQuantity);
            remainingAmount = BigDecimal.ZERO;
            break;
        }

        if (executedQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            return MarketOrderExecution.of(executedAmount, executedQuantity);
        }

        if (remainingAmount.compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException(OrderErrorCode.INSUFFICIENT_MARKET_LIQUIDITY);
        }

        return MarketOrderExecution.of(executedAmount, executedQuantity);
    }

    private MarketOrderExecution calculateMarketSellExecution(String marketCode, BigDecimal orderQuantity) {
        OrderbookResponse orderbook = upbitOrderbookClient.fetchOrderbook(marketCode);
        if (orderbook.orderbookUnits() == null || orderbook.orderbookUnits().isEmpty()) {
            throw new BusinessException(OrderErrorCode.INSUFFICIENT_MARKET_LIQUIDITY);
        }

        BigDecimal remainingQuantity = orderQuantity;
        BigDecimal executedAmount = BigDecimal.ZERO;
        BigDecimal executedQuantity = BigDecimal.ZERO;

        for (OrderbookResponse.OrderBookUnitResponse unit : orderbook.orderbookUnits()) {
            BigDecimal bidPrice = unit.bidPrice();
            BigDecimal bidSize = unit.bidSize();
            validateCurrentPrice(bidPrice);

            if (bidSize == null || bidSize.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            BigDecimal quantity = remainingQuantity.min(bidSize);
            BigDecimal amount = quantity.multiply(bidPrice);
            executedAmount = executedAmount.add(amount);
            executedQuantity = executedQuantity.add(quantity);
            remainingQuantity = remainingQuantity.subtract(quantity);

            if (remainingQuantity.compareTo(BigDecimal.ZERO) == 0) {
                break;
            }
        }

        if (remainingQuantity.compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException(OrderErrorCode.INSUFFICIENT_MARKET_LIQUIDITY);
        }

        return MarketOrderExecution.of(executedAmount, executedQuantity);
    }

    private void validateCurrentPrice(BigDecimal currentPrice) {
        if (currentPrice == null || currentPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(OrderErrorCode.INVALID_MARKET_PRICE);
        }
    }

    private void validateLimitOrder(BigDecimal quantity, BigDecimal limitPrice) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(OrderErrorCode.ORDER_AMOUNT_TOO_SMALL);
        }

        if (limitPrice == null || limitPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(OrderErrorCode.INVALID_LIMIT_PRICE);
        }
    }

    private record MarketOrderExecution(
            BigDecimal executedAmount,
            BigDecimal executedQuantity,
            BigDecimal averageExecutedPrice
    ) {

        private static MarketOrderExecution of(BigDecimal executedAmount, BigDecimal executedQuantity) {
            if (executedQuantity.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException(OrderErrorCode.ORDER_AMOUNT_TOO_SMALL);
            }

            return new MarketOrderExecution(
                    executedAmount,
                    executedQuantity,
                    executedAmount.divide(executedQuantity, QUANTITY_SCALE, RoundingMode.HALF_UP)
            );
        }
    }

}
