package com.sangyunpark.backend.order;

import com.sangyunpark.backend.asset.repository.AssetJpaRepository;
import com.sangyunpark.backend.auth.dto.request.SignupRequest;
import com.sangyunpark.backend.auth.dto.response.AuthTokenResponse;
import com.sangyunpark.backend.auth.service.AuthService;
import com.sangyunpark.backend.common.exception.BusinessException;
import com.sangyunpark.backend.market.price.UpbitMarketPriceProvider;
import com.sangyunpark.backend.order.controller.dto.request.LimitBuyRequest;
import com.sangyunpark.backend.order.controller.dto.request.LimitSellRequest;
import com.sangyunpark.backend.order.controller.dto.request.MarketBuyRequest;
import com.sangyunpark.backend.order.controller.dto.request.MarketSellRequest;
import com.sangyunpark.backend.order.controller.dto.response.CancelLimitOrderResponse;
import com.sangyunpark.backend.order.controller.dto.response.LimitBuyResponse;
import com.sangyunpark.backend.order.controller.dto.response.LimitSellResponse;
import com.sangyunpark.backend.order.controller.dto.response.MarketBuyResponse;
import com.sangyunpark.backend.order.controller.dto.response.MarketSellResponse;
import com.sangyunpark.backend.order.controller.dto.response.TradeHistoryResponse;
import com.sangyunpark.backend.order.entity.LimitOrder;
import com.sangyunpark.backend.order.entity.OrderType;
import com.sangyunpark.backend.order.entity.OrderStatus;
import com.sangyunpark.backend.order.entity.TradeSide;
import com.sangyunpark.backend.order.exception.OrderErrorCode;
import com.sangyunpark.backend.order.repository.LimitOrderJpaRepository;
import com.sangyunpark.backend.order.repository.TradeHistoryJpaRepository;
import com.sangyunpark.backend.order.service.LimitOrderExecutionService;
import com.sangyunpark.backend.order.service.OrderService;
import com.sangyunpark.backend.order.service.PendingLimitOrderIndex;
import com.sangyunpark.backend.user.entity.User;
import com.sangyunpark.backend.user.repository.UserJpaRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@SpringBootTest
@Transactional
class OrderServiceTest {

    @Autowired
    OrderService orderService;

    @Autowired
    LimitOrderExecutionService limitOrderExecutionService;

    @Autowired
    PendingLimitOrderIndex pendingLimitOrderIndex;

    @Autowired
    AuthService authService;

    @Autowired
    UserJpaRepository userJpaRepository;

    @Autowired
    AssetJpaRepository assetJpaRepository;

    @Autowired
    TradeHistoryJpaRepository tradeHistoryJpaRepository;

    @Autowired
    LimitOrderJpaRepository limitOrderJpaRepository;

    @Autowired
    EntityManager entityManager;

    @Autowired
    TransactionTemplate transactionTemplate;

    @MockitoBean
    UpbitMarketPriceProvider upbitMarketPriceProvider;

    @AfterEach
    void tearDown() {
        pendingLimitOrderIndex.clear();
    }

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
    void 지정가_매수_주문을_생성하면_현금이_잠기고_PENDING_주문이_생성된다() {
        AuthTokenResponse signupResponse = signup();
        User user = findUser(signupResponse.user().id());

        LimitBuyResponse response = orderService.limitBuy(
                signupResponse.user().id(),
                new LimitBuyRequest("KRW-BTC", new BigDecimal("0.00200000"), new BigDecimal("50000000"))
        );

        assertThat(response.marketCode()).isEqualTo("KRW-BTC");
        assertThat(response.quantity()).isEqualByComparingTo(new BigDecimal("0.00200000"));
        assertThat(response.limitPrice()).isEqualByComparingTo(new BigDecimal("50000000"));
        assertThat(response.lockedAmount()).isEqualByComparingTo(new BigDecimal("100000.00000000"));
        assertThat(response.status()).isEqualTo(OrderStatus.PENDING);

        flushAndClear();

        assertThat(assetJpaRepository.findByUserAndAssetCode(user, "KRW"))
                .hasValueSatisfying(asset -> {
                    assertThat(asset.getBalance()).isEqualByComparingTo(new BigDecimal("900000.00000000"));
                    assertThat(asset.getLockedBalance()).isEqualByComparingTo(new BigDecimal("100000.00000000"));
                });
        assertThat(limitOrderJpaRepository.findById(response.orderId()))
                .hasValueSatisfying(order -> {
                    assertThat(order.getStatus()).isEqualTo(OrderStatus.PENDING);
                    assertThat(order.getLockedAmount()).isEqualByComparingTo(new BigDecimal("100000.00000000"));
                });
    }

    @Test
    void 지정가_매수_주문_금액이_잔액보다_크면_예외가_발생한다() {
        AuthTokenResponse signupResponse = signup();

        assertThatThrownBy(() -> orderService.limitBuy(
                signupResponse.user().id(),
                new LimitBuyRequest("KRW-BTC", new BigDecimal("1.00000000"), new BigDecimal("1000001"))
        ))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(OrderErrorCode.INSUFFICIENT_BALANCE);
    }

    @Test
    void 지정가_매수_가격이_0이하면_예외가_발생한다() {
        AuthTokenResponse signupResponse = signup();

        assertThatThrownBy(() -> orderService.limitBuy(
                signupResponse.user().id(),
                new LimitBuyRequest("KRW-BTC", new BigDecimal("0.00100000"), BigDecimal.ZERO)
        ))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(OrderErrorCode.INVALID_LIMIT_PRICE);
    }

    @Test
    void 지정가_매수_주문을_취소하면_잠긴_현금이_해제된다() {
        AuthTokenResponse signupResponse = signup();
        User user = findUser(signupResponse.user().id());
        LimitBuyResponse order = orderService.limitBuy(
                signupResponse.user().id(),
                new LimitBuyRequest("KRW-BTC", new BigDecimal("0.00200000"), new BigDecimal("50000000"))
        );

        CancelLimitOrderResponse response = orderService.cancelLimitOrder(signupResponse.user().id(), order.orderId());

        assertThat(response.status()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(response.releasedAmount()).isEqualByComparingTo(new BigDecimal("100000.00000000"));

        flushAndClear();

        assertThat(assetJpaRepository.findByUserAndAssetCode(user, "KRW"))
                .hasValueSatisfying(asset -> {
                    assertThat(asset.getBalance()).isEqualByComparingTo(new BigDecimal("1000000.00000000"));
                    assertThat(asset.getLockedBalance()).isEqualByComparingTo(BigDecimal.ZERO);
                });
        assertThat(limitOrderJpaRepository.findById(order.orderId()))
                .hasValueSatisfying(limitOrder -> assertThat(limitOrder.getStatus()).isEqualTo(OrderStatus.CANCELLED));
    }

    @Test
    void 지정가_매도_주문을_생성하면_코인이_잠기고_PENDING_주문이_생성된다() {
        AuthTokenResponse signupResponse = signup();
        User user = findUser(signupResponse.user().id());
        when(upbitMarketPriceProvider.getCurrentPrice("KRW-BTC"))
                .thenReturn(new BigDecimal("50000000"));
        orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest("KRW-BTC", new BigDecimal("100000"))
        );

        LimitSellResponse response = orderService.limitSell(
                signupResponse.user().id(),
                new LimitSellRequest("KRW-BTC", new BigDecimal("0.00100000"), new BigDecimal("60000000"))
        );

        assertThat(response.marketCode()).isEqualTo("KRW-BTC");
        assertThat(response.quantity()).isEqualByComparingTo(new BigDecimal("0.00100000"));
        assertThat(response.limitPrice()).isEqualByComparingTo(new BigDecimal("60000000"));
        assertThat(response.lockedAmount()).isEqualByComparingTo(new BigDecimal("0.00100000"));
        assertThat(response.status()).isEqualTo(OrderStatus.PENDING);

        flushAndClear();

        assertThat(assetJpaRepository.findByUserAndAssetCode(user, "BTC"))
                .hasValueSatisfying(asset -> {
                    assertThat(asset.getBalance()).isEqualByComparingTo(new BigDecimal("0.00100000"));
                    assertThat(asset.getLockedBalance()).isEqualByComparingTo(new BigDecimal("0.00100000"));
                });
        assertThat(limitOrderJpaRepository.findById(response.orderId()))
                .hasValueSatisfying(order -> {
                    assertThat(order.getTradeSide()).isEqualTo(TradeSide.SELL);
                    assertThat(order.getStatus()).isEqualTo(OrderStatus.PENDING);
                    assertThat(order.getLockedAmount()).isEqualByComparingTo(new BigDecimal("0.00100000"));
                });
    }

    @Test
    void 지정가_매도_수량이_보유_수량보다_크면_예외가_발생한다() {
        AuthTokenResponse signupResponse = signup();

        assertThatThrownBy(() -> orderService.limitSell(
                signupResponse.user().id(),
                new LimitSellRequest("KRW-BTC", new BigDecimal("0.00100000"), new BigDecimal("60000000"))
        ))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(OrderErrorCode.INSUFFICIENT_BALANCE);
    }

    @Test
    void 지정가_매도_가격이_0이하면_예외가_발생한다() {
        AuthTokenResponse signupResponse = signup();
        when(upbitMarketPriceProvider.getCurrentPrice("KRW-BTC"))
                .thenReturn(new BigDecimal("50000000"));
        orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest("KRW-BTC", new BigDecimal("100000"))
        );

        assertThatThrownBy(() -> orderService.limitSell(
                signupResponse.user().id(),
                new LimitSellRequest("KRW-BTC", new BigDecimal("0.00100000"), BigDecimal.ZERO)
        ))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(OrderErrorCode.INVALID_LIMIT_PRICE);
    }

    @Test
    void 지정가_매도_주문을_취소하면_잠긴_코인이_해제된다() {
        AuthTokenResponse signupResponse = signup();
        User user = findUser(signupResponse.user().id());
        when(upbitMarketPriceProvider.getCurrentPrice("KRW-BTC"))
                .thenReturn(new BigDecimal("50000000"));
        orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest("KRW-BTC", new BigDecimal("100000"))
        );
        LimitSellResponse order = orderService.limitSell(
                signupResponse.user().id(),
                new LimitSellRequest("KRW-BTC", new BigDecimal("0.00100000"), new BigDecimal("60000000"))
        );

        CancelLimitOrderResponse response = orderService.cancelLimitOrder(signupResponse.user().id(), order.orderId());

        assertThat(response.status()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(response.releasedAmount()).isEqualByComparingTo(new BigDecimal("0.00100000"));

        flushAndClear();

        assertThat(assetJpaRepository.findByUserAndAssetCode(user, "BTC"))
                .hasValueSatisfying(asset -> {
                    assertThat(asset.getBalance()).isEqualByComparingTo(new BigDecimal("0.00200000"));
                    assertThat(asset.getLockedBalance()).isEqualByComparingTo(BigDecimal.ZERO);
                });
        assertThat(limitOrderJpaRepository.findById(order.orderId()))
                .hasValueSatisfying(limitOrder -> assertThat(limitOrder.getStatus()).isEqualTo(OrderStatus.CANCELLED));
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void 재시도_대기중인_지정가_매도_주문도_취소할_수_있다() {
        AuthTokenResponse signupResponse = signup();
        User user = findUser(signupResponse.user().id());
        String marketCode = "KRW-LS3";
        when(upbitMarketPriceProvider.getCurrentPrice(marketCode))
                .thenReturn(new BigDecimal("50000000"));
        orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest(marketCode, new BigDecimal("100000"))
        );
        LimitSellResponse order = orderService.limitSell(
                signupResponse.user().id(),
                new LimitSellRequest(marketCode, new BigDecimal("0.00100000"), new BigDecimal("60000000"))
        );
        transactionTemplate.executeWithoutResult(status -> {
            int updated = limitOrderJpaRepository.updateStatus(
                    order.orderId(),
                    OrderStatus.PENDING,
                    OrderStatus.EXECUTION_RETRY_PENDING
            );
            assertThat(updated).isEqualTo(1);
        });

        CancelLimitOrderResponse response = orderService.cancelLimitOrder(signupResponse.user().id(), order.orderId());

        assertThat(response.status()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(response.releasedAmount()).isEqualByComparingTo(new BigDecimal("0.00100000"));
        assertThat(limitOrderJpaRepository.findById(order.orderId()))
                .hasValueSatisfying(limitOrder -> assertThat(limitOrder.getStatus()).isEqualTo(OrderStatus.CANCELLED));
        assertThat(assetJpaRepository.findByUserAndAssetCode(user, "LS3"))
                .hasValueSatisfying(asset -> {
                    assertThat(asset.getBalance()).isEqualByComparingTo(new BigDecimal("0.00200000"));
                    assertThat(asset.getLockedBalance()).isEqualByComparingTo(BigDecimal.ZERO);
                });
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void 현재가가_지정가_이하인_PENDING_매수_주문만_체결_후보로_조회한다() {
        AuthTokenResponse signupResponse = signup();
        String marketCode = "KRW-LT1";
        orderService.limitBuy(
                signupResponse.user().id(),
                new LimitBuyRequest(marketCode, new BigDecimal("0.00100000"), new BigDecimal("50000000"))
        );
        orderService.limitBuy(
                signupResponse.user().id(),
                new LimitBuyRequest(marketCode, new BigDecimal("0.00100000"), new BigDecimal("60000000"))
        );
        orderService.limitBuy(
                signupResponse.user().id(),
                new LimitBuyRequest(marketCode, new BigDecimal("0.00100000"), new BigDecimal("40000000"))
        );

        int executableOrderCount = limitOrderExecutionService.executePendingBuyOrders(
                marketCode,
                new BigDecimal("55000000")
        );

        assertThat(executableOrderCount).isEqualTo(1);
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void 현재가가_PENDING_매수_최고_지정가보다_높으면_체결_후보_조회없이_스킵한다() {
        AuthTokenResponse signupResponse = signup();
        String marketCode = "KRW-LT2";
        orderService.limitBuy(
                signupResponse.user().id(),
                new LimitBuyRequest(marketCode, new BigDecimal("0.00100000"), new BigDecimal("50000000"))
        );

        int executableOrderCount = limitOrderExecutionService.executePendingBuyOrders(
                marketCode,
                new BigDecimal("51000000")
        );

        assertThat(executableOrderCount).isZero();
        assertThat(pendingLimitOrderIndex.mayHaveExecutableBuyOrder(marketCode, new BigDecimal("51000000"))).isFalse();
    }

    @Test
    void PENDING_매수_주문이_없는_마켓은_한번_확인한_뒤_체결_후보_조회를_스킵한다() {
        int executableOrderCount = limitOrderExecutionService.executePendingBuyOrders(
                "KRW-BTC",
                new BigDecimal("50000000")
        );

        assertThat(executableOrderCount).isZero();
        assertThat(pendingLimitOrderIndex.mayHaveExecutableBuyOrder("KRW-BTC", new BigDecimal("50000000"))).isFalse();
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void 더_높은_지정가_매수_주문이_생기면_체결_가능성_캐시가_갱신된다() {
        AuthTokenResponse signupResponse = signup();
        String marketCode = "KRW-LT3";
        orderService.limitBuy(
                signupResponse.user().id(),
                new LimitBuyRequest(marketCode, new BigDecimal("0.00100000"), new BigDecimal("50000000"))
        );
        orderService.limitBuy(
                signupResponse.user().id(),
                new LimitBuyRequest(marketCode, new BigDecimal("0.00100000"), new BigDecimal("52000000"))
        );

        int executableOrderCount = limitOrderExecutionService.executePendingBuyOrders(
                marketCode,
                new BigDecimal("51000000")
        );

        assertThat(executableOrderCount).isEqualTo(1);
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void 취소된_지정가_매수_주문은_체결_후보에서_제외한다() {
        AuthTokenResponse signupResponse = signup();
        String marketCode = "KRW-LT4";
        LimitBuyResponse order = orderService.limitBuy(
                signupResponse.user().id(),
                new LimitBuyRequest(marketCode, new BigDecimal("0.00100000"), new BigDecimal("50000000"))
        );
        orderService.cancelLimitOrder(signupResponse.user().id(), order.orderId());

        int executableOrderCount = limitOrderExecutionService.executePendingBuyOrders(
                marketCode,
                new BigDecimal("50000000")
        );

        assertThat(executableOrderCount).isZero();
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void 지정가_매수_주문이_체결되면_잠긴_현금이_정산되고_코인과_거래내역이_생성된다() {
        AuthTokenResponse signupResponse = signup();
        User user = findUser(signupResponse.user().id());
        String marketCode = "KRW-LT5";
        LimitBuyResponse order = orderService.limitBuy(
                signupResponse.user().id(),
                new LimitBuyRequest(marketCode, new BigDecimal("0.00100000"), new BigDecimal("60000000"))
        );

        int executedCount = limitOrderExecutionService.executePendingBuyOrders(
                marketCode,
                new BigDecimal("50000000")
        );

        assertThat(executedCount).isEqualTo(1);

        flushAndClear();

        assertThat(limitOrderJpaRepository.findById(order.orderId()))
                .hasValueSatisfying(limitOrder -> {
                    assertThat(limitOrder.getStatus()).isEqualTo(OrderStatus.FILLED);
                    assertThat(limitOrder.getExecutedQuantity()).isEqualByComparingTo(new BigDecimal("0.00100000"));
                    assertThat(limitOrder.getExecutedAmount()).isEqualByComparingTo(new BigDecimal("50000.00000000"));
                });
        assertThat(assetJpaRepository.findByUserAndAssetCode(user, "KRW"))
                .hasValueSatisfying(asset -> {
                    assertThat(asset.getBalance()).isEqualByComparingTo(new BigDecimal("950000.00000000"));
                    assertThat(asset.getLockedBalance()).isEqualByComparingTo(BigDecimal.ZERO);
                });
        assertThat(assetJpaRepository.findByUserAndAssetCode(user, "LT5"))
                .hasValueSatisfying(asset -> {
                    assertThat(asset.getBalance()).isEqualByComparingTo(new BigDecimal("0.00100000"));
                    assertThat(asset.getAverageBuyPrice()).isEqualByComparingTo(new BigDecimal("50000000"));
                });
        assertThat(tradeHistoryJpaRepository.findByUserOrderByIdDesc(user, PageRequest.of(0, 10)))
                .hasSize(1)
                .first()
                .satisfies(tradeHistory -> {
                    assertThat(tradeHistory.getTradeSide()).isEqualTo(TradeSide.BUY);
                    assertThat(tradeHistory.getOrderType()).isEqualTo(OrderType.LIMIT);
                    assertThat(tradeHistory.getQuantity()).isEqualByComparingTo(new BigDecimal("0.00100000"));
                    assertThat(tradeHistory.getPrice()).isEqualByComparingTo(new BigDecimal("50000000"));
                    assertThat(tradeHistory.getTotalAmount()).isEqualByComparingTo(new BigDecimal("50000.00000000"));
                });
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void 지정가_매수_체결이_실패하면_주문은_재시도_대기상태가_되고_잠긴_현금은_유지된다() {
        AuthTokenResponse signupResponse = signup();
        BigDecimal quantity = new BigDecimal("0.00100000");
        BigDecimal limitPrice = new BigDecimal("50000000");
        BigDecimal lockedAmount = new BigDecimal("50000.00000000");
        AtomicReference<Long> orderId = new AtomicReference<>();

        transactionTemplate.executeWithoutResult(status -> {
            User user = userJpaRepository.findById(signupResponse.user().id()).orElseThrow();
            int lockedRows = assetJpaRepository.lockBalance(user.getId(), "KRW", lockedAmount);
            assertThat(lockedRows).isEqualTo(1);

            LimitOrder order = limitOrderJpaRepository.save(
                    LimitOrder.limitBuy(user, "KRW", quantity, limitPrice, lockedAmount)
            );
            orderId.set(order.getId());
        });

        int executedCount = limitOrderExecutionService.executePendingBuyOrders("KRW", limitPrice);

        assertThat(executedCount).isZero();
        assertThat(limitOrderJpaRepository.findById(orderId.get()))
                .hasValueSatisfying(limitOrder ->
                        assertThat(limitOrder.getStatus()).isEqualTo(OrderStatus.EXECUTION_RETRY_PENDING)
                );
        assertThat(assetJpaRepository.findByUserAndAssetCode(findUser(signupResponse.user().id()), "KRW"))
                .hasValueSatisfying(asset -> {
                    assertThat(asset.getBalance()).isEqualByComparingTo(new BigDecimal("950000.00000000"));
                    assertThat(asset.getLockedBalance()).isEqualByComparingTo(lockedAmount);
                });
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void 지정가_매도_주문이_체결되면_잠긴_코인이_정산되고_현금과_거래내역이_생성된다() {
        AuthTokenResponse signupResponse = signup();
        User user = findUser(signupResponse.user().id());
        String marketCode = "KRW-LS1";
        when(upbitMarketPriceProvider.getCurrentPrice(marketCode))
                .thenReturn(new BigDecimal("50000000"));
        orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest(marketCode, new BigDecimal("100000"))
        );
        LimitSellResponse order = orderService.limitSell(
                signupResponse.user().id(),
                new LimitSellRequest(marketCode, new BigDecimal("0.00100000"), new BigDecimal("60000000"))
        );

        int executedCount = limitOrderExecutionService.executePendingSellOrders(
                marketCode,
                new BigDecimal("61000000")
        );

        assertThat(executedCount).isEqualTo(1);

        flushAndClear();

        assertThat(limitOrderJpaRepository.findById(order.orderId()))
                .hasValueSatisfying(limitOrder -> {
                    assertThat(limitOrder.getStatus()).isEqualTo(OrderStatus.FILLED);
                    assertThat(limitOrder.getExecutedQuantity()).isEqualByComparingTo(new BigDecimal("0.00100000"));
                    assertThat(limitOrder.getExecutedAmount()).isEqualByComparingTo(new BigDecimal("61000.00000000"));
                });
        assertThat(assetJpaRepository.findByUserAndAssetCode(user, "KRW"))
                .hasValueSatisfying(asset -> {
                    assertThat(asset.getBalance()).isEqualByComparingTo(new BigDecimal("961000.00000000"));
                    assertThat(asset.getLockedBalance()).isEqualByComparingTo(BigDecimal.ZERO);
                });
        assertThat(assetJpaRepository.findByUserAndAssetCode(user, "LS1"))
                .hasValueSatisfying(asset -> {
                    assertThat(asset.getBalance()).isEqualByComparingTo(new BigDecimal("0.00100000"));
                    assertThat(asset.getLockedBalance()).isEqualByComparingTo(BigDecimal.ZERO);
                });
        assertThat(tradeHistoryJpaRepository.findByUserOrderByIdDesc(user, PageRequest.of(0, 10)))
                .hasSize(2)
                .first()
                .satisfies(tradeHistory -> {
                    assertThat(tradeHistory.getTradeSide()).isEqualTo(TradeSide.SELL);
                    assertThat(tradeHistory.getOrderType()).isEqualTo(OrderType.LIMIT);
                    assertThat(tradeHistory.getQuantity()).isEqualByComparingTo(new BigDecimal("0.00100000"));
                    assertThat(tradeHistory.getPrice()).isEqualByComparingTo(new BigDecimal("61000000"));
                    assertThat(tradeHistory.getTotalAmount()).isEqualByComparingTo(new BigDecimal("61000.00000000"));
                });
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void 지정가_매도로_코인을_전량_체결하면_평균_매수가가_초기화된다() {
        AuthTokenResponse signupResponse = signup();
        User user = findUser(signupResponse.user().id());
        String marketCode = "KRW-LS2";
        when(upbitMarketPriceProvider.getCurrentPrice(marketCode))
                .thenReturn(new BigDecimal("50000000"));
        orderService.marketBuy(
                signupResponse.user().id(),
                new MarketBuyRequest(marketCode, new BigDecimal("100000"))
        );
        orderService.limitSell(
                signupResponse.user().id(),
                new LimitSellRequest(marketCode, new BigDecimal("0.00200000"), new BigDecimal("60000000"))
        );

        int executedCount = limitOrderExecutionService.executePendingSellOrders(
                marketCode,
                new BigDecimal("61000000")
        );

        assertThat(executedCount).isEqualTo(1);

        flushAndClear();

        assertThat(assetJpaRepository.findByUserAndAssetCode(user, "LS2"))
                .hasValueSatisfying(asset -> {
                    assertThat(asset.getBalance()).isEqualByComparingTo(BigDecimal.ZERO);
                    assertThat(asset.getLockedBalance()).isEqualByComparingTo(BigDecimal.ZERO);
                    assertThat(asset.getAverageBuyPrice()).isEqualByComparingTo(BigDecimal.ZERO);
                });
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void 이미_체결된_지정가_매수_주문은_다시_체결하지_않는다() {
        AuthTokenResponse signupResponse = signup();
        User user = findUser(signupResponse.user().id());
        String marketCode = "KRW-LT6";
        orderService.limitBuy(
                signupResponse.user().id(),
                new LimitBuyRequest(marketCode, new BigDecimal("0.00100000"), new BigDecimal("50000000"))
        );

        int firstExecutedCount = limitOrderExecutionService.executePendingBuyOrders(
                marketCode,
                new BigDecimal("50000000")
        );
        int secondExecutedCount = limitOrderExecutionService.executePendingBuyOrders(
                marketCode,
                new BigDecimal("50000000")
        );

        assertThat(firstExecutedCount).isEqualTo(1);
        assertThat(secondExecutedCount).isZero();
        assertThat(assetJpaRepository.findByUserAndAssetCode(user, "LT6"))
                .hasValueSatisfying(asset -> assertThat(asset.getBalance()).isEqualByComparingTo(new BigDecimal("0.00100000")));
        assertThat(tradeHistoryJpaRepository.findByUserOrderByIdDesc(user, PageRequest.of(0, 10))).hasSize(1);
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
                "test-" + UUID.randomUUID() + "@test.com",
                "12345678",
                "sangyun"
        ));
    }

    private User findUser(Long userId) {
        return userJpaRepository.findById(userId).orElseThrow();
    }

    private void flushAndClear() {
        if (entityManager.isJoinedToTransaction()) {
            entityManager.flush();
        }
        entityManager.clear();
    }
}
