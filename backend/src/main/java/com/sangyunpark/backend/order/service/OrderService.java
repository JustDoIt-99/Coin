package com.sangyunpark.backend.order.service;

import com.sangyunpark.backend.asset.entity.Asset;
import com.sangyunpark.backend.asset.repository.AssetJpaRepository;
import com.sangyunpark.backend.auth.exception.AuthErrorCode;
import com.sangyunpark.backend.common.exception.BusinessException;
import com.sangyunpark.backend.market.price.UpbitMarketPriceProvider;
import com.sangyunpark.backend.order.controller.dto.request.MarketBuyRequest;
import com.sangyunpark.backend.order.controller.dto.response.MarketBuyResponse;
import com.sangyunpark.backend.order.controller.dto.response.TradeHistoryResponse;
import com.sangyunpark.backend.order.entity.TradeHistory;
import com.sangyunpark.backend.order.exception.OrderErrorCode;
import com.sangyunpark.backend.order.repository.TradeHistoryJpaRepository;
import com.sangyunpark.backend.order.service.dto.MarketPair;
import com.sangyunpark.backend.user.entity.User;
import com.sangyunpark.backend.user.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final int QUANTITY_SCALE = 8;
    private static final BigDecimal MIN_EXECUTED_QUANTITY = new BigDecimal("0.00000001");

    private final UserJpaRepository userJpaRepository;
    private final AssetJpaRepository assetJpaRepository;
    private final UpbitMarketPriceProvider upbitMarketPriceProvider;
    private final TradeHistoryJpaRepository tradeHistoryJpaRepository;

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

    @Transactional(readOnly = true)
    public List<TradeHistoryResponse> getTradeHistories(Long userId) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        return tradeHistoryJpaRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(TradeHistoryResponse::from)
                .toList();
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
}
