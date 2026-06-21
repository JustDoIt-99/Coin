package com.sangyunpark.backend.order;

import com.sangyunpark.backend.asset.repository.AssetJpaRepository;
import com.sangyunpark.backend.auth.dto.request.SignupRequest;
import com.sangyunpark.backend.auth.dto.response.AuthTokenResponse;
import com.sangyunpark.backend.auth.service.AuthService;
import com.sangyunpark.backend.common.exception.BusinessException;
import com.sangyunpark.backend.market.price.UpbitMarketPriceProvider;
import com.sangyunpark.backend.order.controller.dto.request.MarketBuyRequest;
import com.sangyunpark.backend.order.controller.dto.request.MarketSellRequest;
import com.sangyunpark.backend.order.controller.dto.response.MarketBuyResponse;
import com.sangyunpark.backend.order.controller.dto.response.MarketSellResponse;
import com.sangyunpark.backend.order.controller.dto.response.TradeHistoryResponse;
import com.sangyunpark.backend.order.exception.OrderErrorCode;
import com.sangyunpark.backend.order.repository.TradeHistoryJpaRepository;
import com.sangyunpark.backend.order.service.OrderService;
import com.sangyunpark.backend.user.entity.User;
import com.sangyunpark.backend.user.repository.UserJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
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
class OrderServiceTest {

    @Autowired
    OrderService orderService;

    @Autowired
    AuthService authService;

    @Autowired
    UserJpaRepository userJpaRepository;

    @Autowired
    AssetJpaRepository assetJpaRepository;

    @Autowired
    TradeHistoryJpaRepository tradeHistoryJpaRepository;

    @MockitoBean
    UpbitMarketPriceProvider upbitMarketPriceProvider;

    @Test
    void 시장가_매수에_성공하면_현금이_차감되고_코인_자산과_거래내역이_생성된다() {
        AuthTokenResponse signupResponse = signup();
        User user = findUser(signupResponse.user().id());
        when(upbitMarketPriceProvider.getCurrentPrice("KRW-BTC"))
                .thenReturn(new BigDecimal("50000000"));

        MarketBuyResponse response = orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest("KRW-BTC", new BigDecimal("100000"))
        );

        assertThat(response.marketCode()).isEqualTo("KRW-BTC");
        assertThat(response.orderAmount()).isEqualByComparingTo(new BigDecimal("100000"));
        assertThat(response.executedPrice()).isEqualByComparingTo(new BigDecimal("50000000"));
        assertThat(response.executedQuantity()).isEqualByComparingTo(new BigDecimal("0.00200000"));
        assertThat(response.executedAmount()).isEqualByComparingTo(new BigDecimal("100000"));
        assertThat(response.remainingCashBalance()).isEqualByComparingTo(new BigDecimal("900000"));
        assertThat(response.coinBalance()).isEqualByComparingTo(new BigDecimal("0.00200000"));
        assertThat(response.averageBuyPrice()).isEqualByComparingTo(new BigDecimal("50000000"));

        assertThat(assetJpaRepository.findByUserAndAssetCode(user, "KRW"))
                .hasValueSatisfying(asset ->
                        assertThat(asset.getBalance()).isEqualByComparingTo(new BigDecimal("900000"))
                );
        assertThat(assetJpaRepository.findByUserAndAssetCode(user, "BTC"))
                .hasValueSatisfying(asset -> {
                    assertThat(asset.getBalance()).isEqualByComparingTo(new BigDecimal("0.00200000"));
                    assertThat(asset.getAverageBuyPrice()).isEqualByComparingTo(new BigDecimal("50000000"));
                });
        assertThat(tradeHistoryJpaRepository.findByUserOrderByIdDesc(user, PageRequest.of(0, 10)))
                .hasSize(1)
                .first()
                .satisfies(tradeHistory -> {
                    assertThat(tradeHistory.getMarketCode()).isEqualTo("KRW-BTC");
                    assertThat(tradeHistory.getQuantity()).isEqualByComparingTo(new BigDecimal("0.00200000"));
                    assertThat(tradeHistory.getPrice()).isEqualByComparingTo(new BigDecimal("50000000"));
                    assertThat(tradeHistory.getTotalAmount()).isEqualByComparingTo(new BigDecimal("100000"));
                });
    }

    @Test
    void 시장가_매도에_성공하면_코인이_차감되고_현금과_거래내역이_증가한다() {
        AuthTokenResponse signupResponse = signup();
        User user = findUser(signupResponse.user().id());
        when(upbitMarketPriceProvider.getCurrentPrice("KRW-BTC"))
                .thenReturn(new BigDecimal("50000000"));

        orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest("KRW-BTC", new BigDecimal("100000"))
        );

        MarketSellResponse response = orderService.marketSell(
                signupResponse.user().id(),
                new MarketSellRequest("KRW-BTC", new BigDecimal("0.00100000"))
        );

        assertThat(response.marketCode()).isEqualTo("KRW-BTC");
        assertThat(response.orderQuantity()).isEqualByComparingTo(new BigDecimal("0.00100000"));
        assertThat(response.executedPrice()).isEqualByComparingTo(new BigDecimal("50000000"));
        assertThat(response.executedQuantity()).isEqualByComparingTo(new BigDecimal("0.00100000"));
        assertThat(response.executedAmount()).isEqualByComparingTo(new BigDecimal("50000"));
        assertThat(response.cashBalance()).isEqualByComparingTo(new BigDecimal("950000"));
        assertThat(response.coinBalance()).isEqualByComparingTo(new BigDecimal("0.00100000"));
        assertThat(response.averageBuyPrice()).isEqualByComparingTo(new BigDecimal("50000000"));

        assertThat(assetJpaRepository.findByUserAndAssetCode(user, "KRW"))
                .hasValueSatisfying(asset ->
                        assertThat(asset.getBalance()).isEqualByComparingTo(new BigDecimal("950000"))
                );
        assertThat(assetJpaRepository.findByUserAndAssetCode(user, "BTC"))
                .hasValueSatisfying(asset -> {
                    assertThat(asset.getBalance()).isEqualByComparingTo(new BigDecimal("0.00100000"));
                    assertThat(asset.getAverageBuyPrice()).isEqualByComparingTo(new BigDecimal("50000000"));
                });
        assertThat(tradeHistoryJpaRepository.findByUserOrderByIdDesc(user, PageRequest.of(0, 10)))
                .hasSize(2)
                .first()
                .satisfies(tradeHistory -> {
                    assertThat(tradeHistory.getMarketCode()).isEqualTo("KRW-BTC");
                    assertThat(tradeHistory.getQuantity()).isEqualByComparingTo(new BigDecimal("0.00100000"));
                    assertThat(tradeHistory.getPrice()).isEqualByComparingTo(new BigDecimal("50000000"));
                    assertThat(tradeHistory.getTotalAmount()).isEqualByComparingTo(new BigDecimal("50000"));
                });
    }

    @Test
    void 시장가_전량_매도에_성공하면_코인_평균_매수가가_초기화된다() {
        AuthTokenResponse signupResponse = signup();
        User user = findUser(signupResponse.user().id());
        when(upbitMarketPriceProvider.getCurrentPrice("KRW-BTC"))
                .thenReturn(new BigDecimal("50000000"));

        orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest("KRW-BTC", new BigDecimal("100000"))
        );

        MarketSellResponse response = orderService.marketSell(
                signupResponse.user().id(),
                new MarketSellRequest("KRW-BTC", new BigDecimal("0.00200000"))
        );

        assertThat(response.coinBalance()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.averageBuyPrice()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(assetJpaRepository.findByUserAndAssetCode(user, "BTC"))
                .hasValueSatisfying(asset -> {
                    assertThat(asset.getBalance()).isEqualByComparingTo(BigDecimal.ZERO);
                    assertThat(asset.getAverageBuyPrice()).isEqualByComparingTo(BigDecimal.ZERO);
                });
    }

    @Test
    void 시장가_매수_금액이_잔액보다_크면_예외가_발생한다() {
        AuthTokenResponse signupResponse = signup();

        assertThatThrownBy(() -> orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest("KRW-BTC", new BigDecimal("1000001"))
        ))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(OrderErrorCode.INSUFFICIENT_BALANCE);
    }

    @Test
    void 시장가_매도_수량이_보유_수량보다_크면_예외가_발생한다() {
        AuthTokenResponse signupResponse = signup();

        assertThatThrownBy(() -> orderService.marketSell(
                signupResponse.user().id(),
                new MarketSellRequest("KRW-BTC", new BigDecimal("0.001"))
        ))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(OrderErrorCode.INSUFFICIENT_BALANCE);
    }

    @Test
    void 시장가_매수_수량이_최소_체결_수량보다_작으면_예외가_발생한다() {
        AuthTokenResponse signupResponse = signup();
        when(upbitMarketPriceProvider.getCurrentPrice("KRW-BTC"))
                .thenReturn(new BigDecimal("100000000"));

        assertThatThrownBy(() -> orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest("KRW-BTC", new BigDecimal("0.5"))
        ))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(OrderErrorCode.ORDER_AMOUNT_TOO_SMALL);
    }

    @Test
    void 시장가_매수_현재가가_null이면_예외가_발생한다() {
        AuthTokenResponse signupResponse = signup();
        when(upbitMarketPriceProvider.getCurrentPrice("KRW-BTC"))
                .thenReturn(null);

        assertThatThrownBy(() -> orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest("KRW-BTC", new BigDecimal("100000"))
        ))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(OrderErrorCode.INVALID_MARKET_PRICE);
    }

    @Test
    void 시장가_매수_현재가가_0이하면_예외가_발생한다() {
        AuthTokenResponse signupResponse = signup();
        when(upbitMarketPriceProvider.getCurrentPrice("KRW-BTC"))
                .thenReturn(BigDecimal.ZERO);

        assertThatThrownBy(() -> orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest("KRW-BTC", new BigDecimal("100000"))
        ))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(OrderErrorCode.INVALID_MARKET_PRICE);
    }

    @Test
    void 시장가_매도_현재가가_0이하면_예외가_발생한다() {
        AuthTokenResponse signupResponse = signup();
        when(upbitMarketPriceProvider.getCurrentPrice("KRW-BTC"))
                .thenReturn(new BigDecimal("50000000"));
        orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest("KRW-BTC", new BigDecimal("100000"))
        );
        when(upbitMarketPriceProvider.getCurrentPrice("KRW-BTC"))
                .thenReturn(BigDecimal.ZERO);

        assertThatThrownBy(() -> orderService.marketSell(
                signupResponse.user().id(),
                new MarketSellRequest("KRW-BTC", new BigDecimal("0.001"))
        ))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(OrderErrorCode.INVALID_MARKET_PRICE);
    }

    @Test
    void 거래내역을_최신순으로_조회한다() {
        AuthTokenResponse signupResponse = signup();
        when(upbitMarketPriceProvider.getCurrentPrice("KRW-BTC"))
                .thenReturn(new BigDecimal("50000000"));

        orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest("KRW-BTC", new BigDecimal("100000"))
        );

        List<TradeHistoryResponse> responses = orderService.getTradeHistories(signupResponse.user().id(), null, 20).items();

        assertThat(responses)
                .hasSize(1)
                .first()
                .satisfies(response -> {
                    assertThat(response.marketCode()).isEqualTo("KRW-BTC");
                    assertThat(response.quantity()).isEqualByComparingTo(new BigDecimal("0.00200000"));
                    assertThat(response.price()).isEqualByComparingTo(new BigDecimal("50000000"));
                    assertThat(response.totalAmount()).isEqualByComparingTo(new BigDecimal("100000"));
                    assertThat(response.orderedAt()).isNotNull();
                    assertThat(response.executedAt()).isNotNull();
                });
    }

    @Test
    void 거래내역은_커서_기반으로_조회한다() {
        AuthTokenResponse signupResponse = signup();
        when(upbitMarketPriceProvider.getCurrentPrice("KRW-BTC"))
                .thenReturn(new BigDecimal("50000000"));

        orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest("KRW-BTC", new BigDecimal("100000"))
        );
        orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest("KRW-BTC", new BigDecimal("200000"))
        );

        var firstPage = orderService.getTradeHistories(signupResponse.user().id(), null, 1);
        var secondPage = orderService.getTradeHistories(signupResponse.user().id(), firstPage.nextCursorId(), 1);

        assertThat(firstPage.items()).hasSize(1);
        assertThat(firstPage.hasNext()).isTrue();
        assertThat(firstPage.nextCursorId()).isEqualTo(firstPage.items().get(0).id());
        assertThat(secondPage.items()).hasSize(1);
        assertThat(secondPage.hasNext()).isFalse();
        assertThat(secondPage.nextCursorId()).isNull();
        assertThat(firstPage.items().get(0).id()).isGreaterThan(secondPage.items().get(0).id());
    }

    private AuthTokenResponse signup() {
        return authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));
    }

    private User findUser(Long userId) {
        return userJpaRepository.findById(userId).orElseThrow();
    }
}
