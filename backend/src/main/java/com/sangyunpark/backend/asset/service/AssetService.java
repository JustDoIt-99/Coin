package com.sangyunpark.backend.asset.service;

import com.sangyunpark.backend.asset.controller.dto.response.AssetResponse;
import com.sangyunpark.backend.asset.controller.dto.response.PortfolioAssetResponse;
import com.sangyunpark.backend.asset.controller.dto.response.PortfolioAssetSummaryResponse;
import com.sangyunpark.backend.asset.entity.Asset;
import com.sangyunpark.backend.asset.repository.AssetJpaRepository;
import com.sangyunpark.backend.auth.exception.AuthErrorCode;
import com.sangyunpark.backend.common.exception.BusinessException;
import com.sangyunpark.backend.market.price.UpbitMarketPriceProvider;
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
public class AssetService {

    private static final String CASH_ASSET_CODE = "KRW";
    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");
    private static final int RATE_SCALE = 4;

    private final UserJpaRepository userJpaRepository;
    private final AssetJpaRepository assetJpaRepository;
    private final UpbitMarketPriceProvider upbitMarketPriceProvider;

    @Transactional(readOnly = true)
    public List<AssetResponse> getAssets(Long userId) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        return assetJpaRepository.findByUserOrderByAssetCodeAsc(user)
                .stream()
                .map(AssetResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PortfolioAssetSummaryResponse getPortfolioAssetSummary(Long userId) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        List<Asset> assets = assetJpaRepository.findByUserOrderByAssetCodeAsc(user);
        BigDecimal cashBalance = findCashBalance(assets);
        List<PortfolioAssetResponse> assetResponses = assets.stream()
                .filter(asset -> asset.getBalance().compareTo(BigDecimal.ZERO) > 0)
                .map(this::toPortfolioAssetResponse)
                .toList();

        BigDecimal totalValuationAmount = assetResponses.stream()
                .filter(asset -> !asset.assetCode().equals(CASH_ASSET_CODE))
                .map(PortfolioAssetResponse::valuationAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalBuyAmount = assetResponses.stream()
                .filter(asset -> !asset.assetCode().equals(CASH_ASSET_CODE))
                .map(PortfolioAssetResponse::buyAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalAssetAmount = cashBalance.add(totalValuationAmount);
        BigDecimal totalProfitAmount = totalValuationAmount.subtract(totalBuyAmount);
        BigDecimal totalProfitRate = calculateRate(totalProfitAmount, totalBuyAmount);
        List<PortfolioAssetResponse> weightedAssets = assetResponses.stream()
                .map(asset -> applyWeight(asset, totalAssetAmount))
                .toList();

        return new PortfolioAssetSummaryResponse(
                cashBalance,
                totalAssetAmount,
                totalBuyAmount,
                totalValuationAmount,
                totalProfitAmount,
                totalProfitRate,
                cashBalance,
                weightedAssets
        );
    }

    private PortfolioAssetResponse toPortfolioAssetResponse(Asset asset) {
        BigDecimal currentPrice = getCurrentPrice(asset.getAssetCode());
        if (currentPrice == null) {
            currentPrice = asset.getAverageBuyPrice();
        }

        BigDecimal valuationAmount = asset.getBalance().multiply(currentPrice);
        BigDecimal buyAmount = asset.getAssetCode().equals(CASH_ASSET_CODE)
                ? BigDecimal.ZERO
                : asset.getBalance().multiply(asset.getAverageBuyPrice());
        BigDecimal profitAmount = asset.getAssetCode().equals(CASH_ASSET_CODE)
                ? BigDecimal.ZERO
                : valuationAmount.subtract(buyAmount);
        BigDecimal profitRate = calculateRate(profitAmount, buyAmount);

        return new PortfolioAssetResponse(
                asset.getAssetCode(),
                asset.getBalance(),
                asset.getAverageBuyPrice(),
                currentPrice,
                buyAmount,
                valuationAmount,
                profitAmount,
                profitRate,
                BigDecimal.ZERO
        );
    }

    private PortfolioAssetResponse applyWeight(PortfolioAssetResponse asset, BigDecimal totalAssetAmount) {
        return new PortfolioAssetResponse(
                asset.assetCode(),
                asset.balance(),
                asset.averageBuyPrice(),
                asset.currentPrice(),
                asset.buyAmount(),
                asset.valuationAmount(),
                asset.profitAmount(),
                asset.profitRate(),
                calculateRate(asset.valuationAmount(), totalAssetAmount)
        );
    }

    private BigDecimal getCurrentPrice(String assetCode) {
        if (assetCode.equals(CASH_ASSET_CODE)) {
            return BigDecimal.ONE;
        }

        return upbitMarketPriceProvider.getCurrentPrice(CASH_ASSET_CODE + "-" + assetCode);
    }

    private BigDecimal findCashBalance(List<Asset> assets) {
        return assets.stream()
                .filter(asset -> asset.getAssetCode().equals(CASH_ASSET_CODE))
                .findFirst()
                .map(Asset::getBalance)
                .orElse(BigDecimal.ZERO);
    }

    private BigDecimal calculateRate(BigDecimal numerator, BigDecimal denominator) {
        if (denominator.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return numerator.multiply(ONE_HUNDRED)
                .divide(denominator, RATE_SCALE, RoundingMode.HALF_UP);
    }
}
