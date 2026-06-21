package com.sangyunpark.backend.asset;

import com.sangyunpark.backend.asset.controller.dto.response.AssetResponse;
import com.sangyunpark.backend.asset.controller.dto.response.PortfolioAssetSummaryResponse;
import com.sangyunpark.backend.asset.entity.Asset;
import com.sangyunpark.backend.asset.repository.AssetJpaRepository;
import com.sangyunpark.backend.asset.service.AssetService;
import com.sangyunpark.backend.auth.dto.request.SignupRequest;
import com.sangyunpark.backend.auth.dto.response.AuthTokenResponse;
import com.sangyunpark.backend.auth.service.AuthService;
import com.sangyunpark.backend.common.exception.BusinessException;
import com.sangyunpark.backend.market.price.UpbitMarketPriceProvider;
import com.sangyunpark.backend.order.exception.OrderErrorCode;
import com.sangyunpark.backend.user.repository.UserJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@SpringBootTest
@Transactional
class AssetServiceTest {

    @Autowired
    AssetService assetService;

    @Autowired
    AuthService authService;

    @Autowired
    UserJpaRepository userJpaRepository;

    @Autowired
    AssetJpaRepository assetJpaRepository;

    @MockitoBean
    UpbitMarketPriceProvider upbitMarketPriceProvider;

    @Test
    void 내_자산_목록을_조회한다() {
        AuthTokenResponse signupResponse = authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));

        List<AssetResponse> responses = assetService.getAssets(signupResponse.user().id());

        assertThat(responses)
                .hasSize(1)
                .first()
                .satisfies(response -> {
                    assertThat(response.assetCode()).isEqualTo("KRW");
                    assertThat(response.balance()).isEqualByComparingTo(new BigDecimal("1000000"));
                    assertThat(response.averageBuyPrice()).isEqualByComparingTo(BigDecimal.ZERO);
                });
    }

    @Test
    void 포트폴리오_보유자산_요약을_조회한다() {
        AuthTokenResponse signupResponse = authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));
        var user = userJpaRepository.findById(signupResponse.user().id()).orElseThrow();
        Asset btcAsset = Asset.create(user, "BTC");
        btcAsset.buy(new BigDecimal("0.00200000"), new BigDecimal("50000000"));
        assetJpaRepository.save(btcAsset);
        when(upbitMarketPriceProvider.getCurrentPrice("KRW-BTC"))
                .thenReturn(new BigDecimal("60000000"));

        PortfolioAssetSummaryResponse response = assetService.getPortfolioAssetSummary(signupResponse.user().id());

        assertThat(response.cashBalance()).isEqualByComparingTo(new BigDecimal("1000000"));
        assertThat(response.totalAssetAmount()).isEqualByComparingTo(new BigDecimal("1120000.00000000"));
        assertThat(response.totalBuyAmount()).isEqualByComparingTo(new BigDecimal("100000.00000000"));
        assertThat(response.totalValuationAmount()).isEqualByComparingTo(new BigDecimal("120000.00000000"));
        assertThat(response.totalProfitAmount()).isEqualByComparingTo(new BigDecimal("20000.00000000"));
        assertThat(response.totalProfitRate()).isEqualByComparingTo(new BigDecimal("20.0000"));
        assertThat(response.availableOrderAmount()).isEqualByComparingTo(new BigDecimal("1000000"));
        assertThat(response.assets()).hasSize(2);
        assertThat(response.assets())
                .filteredOn(asset -> asset.assetCode().equals("BTC"))
                .first()
                .satisfies(asset -> {
                    assertThat(asset.balance()).isEqualByComparingTo(new BigDecimal("0.00200000"));
                    assertThat(asset.averageBuyPrice()).isEqualByComparingTo(new BigDecimal("50000000"));
                    assertThat(asset.currentPrice()).isEqualByComparingTo(new BigDecimal("60000000"));
                    assertThat(asset.buyAmount()).isEqualByComparingTo(new BigDecimal("100000.00000000"));
                    assertThat(asset.valuationAmount()).isEqualByComparingTo(new BigDecimal("120000.00000000"));
                    assertThat(asset.profitAmount()).isEqualByComparingTo(new BigDecimal("20000.00000000"));
                    assertThat(asset.profitRate()).isEqualByComparingTo(new BigDecimal("20.0000"));
                    assertThat(asset.weight()).isEqualByComparingTo(new BigDecimal("10.7143"));
                });
    }

    @Test
    void 실시간_시세를_조회하지_못하면_평균_매수가로_포트폴리오_보유자산_요약을_계산한다() {
        AuthTokenResponse signupResponse = authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));
        var user = userJpaRepository.findById(signupResponse.user().id()).orElseThrow();
        Asset btcAsset = Asset.create(user, "BTC");
        btcAsset.buy(new BigDecimal("0.00200000"), new BigDecimal("50000000"));
        assetJpaRepository.save(btcAsset);
        when(upbitMarketPriceProvider.getCurrentPrice("KRW-BTC"))
                .thenReturn(null);

        PortfolioAssetSummaryResponse response = assetService.getPortfolioAssetSummary(signupResponse.user().id());

        assertThat(response.totalAssetAmount()).isEqualByComparingTo(new BigDecimal("1100000.00000000"));
        assertThat(response.totalValuationAmount()).isEqualByComparingTo(new BigDecimal("100000.00000000"));
        assertThat(response.totalProfitAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.totalProfitRate()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.assets())
                .filteredOn(asset -> asset.assetCode().equals("BTC"))
                .first()
                .satisfies(asset -> {
                    assertThat(asset.currentPrice()).isEqualByComparingTo(new BigDecimal("50000000"));
                    assertThat(asset.valuationAmount()).isEqualByComparingTo(new BigDecimal("100000.00000000"));
                    assertThat(asset.profitAmount()).isEqualByComparingTo(BigDecimal.ZERO);
                    assertThat(asset.profitRate()).isEqualByComparingTo(BigDecimal.ZERO);
                });
    }

    @Test
    void 자산에_0이하_금액을_입금하면_예외가_발생한다() {
        AuthTokenResponse signupResponse = authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));

        var user = userJpaRepository.findById(signupResponse.user().id()).orElseThrow();
        var krwAsset = assetJpaRepository.findByUserAndAssetCode(user, "KRW").orElseThrow();

        assertThatThrownBy(() -> krwAsset.deposit(BigDecimal.ZERO))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(OrderErrorCode.INVALID_ASSET_AMOUNT);
    }

    @Test
    void 자산에_0이하_수량을_매도하면_예외가_발생한다() {
        AuthTokenResponse signupResponse = authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));

        var user = userJpaRepository.findById(signupResponse.user().id()).orElseThrow();
        var krwAsset = assetJpaRepository.findByUserAndAssetCode(user, "KRW").orElseThrow();

        assertThatThrownBy(() -> krwAsset.sell(BigDecimal.ZERO))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(OrderErrorCode.INVALID_ASSET_AMOUNT);
    }
}
