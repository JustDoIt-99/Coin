package com.sangyunpark.backend.order.controller;

import com.sangyunpark.backend.order.controller.dto.request.MarketBuyRequest;
import com.sangyunpark.backend.order.controller.dto.request.LimitBuyRequest;
import com.sangyunpark.backend.order.controller.dto.request.LimitSellRequest;
import com.sangyunpark.backend.order.controller.dto.request.MarketSellRequest;
import com.sangyunpark.backend.order.controller.dto.response.CancelLimitOrderResponse;
import com.sangyunpark.backend.order.controller.dto.response.LimitBuyResponse;
import com.sangyunpark.backend.order.controller.dto.response.LimitSellResponse;
import com.sangyunpark.backend.order.controller.dto.response.MarketBuyResponse;
import com.sangyunpark.backend.order.controller.dto.response.MarketSellResponse;
import com.sangyunpark.backend.order.controller.dto.response.PendingLimitOrderResponse;
import com.sangyunpark.backend.order.controller.dto.response.TradeHistoryCursorResponse;
import com.sangyunpark.backend.order.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private static final String USER_ID = "userId";

    private final OrderService orderService;

    @PostMapping("/market-buy")
    public MarketBuyResponse marketBuy(HttpServletRequest request, @Valid @RequestBody MarketBuyRequest marketBuyRequest) {
        Long userId = (Long) request.getAttribute(USER_ID);
        return orderService.marketBuy(userId, marketBuyRequest);
    }

    @PostMapping("/market-sell")
    public MarketSellResponse marketSell(HttpServletRequest request, @Valid @RequestBody MarketSellRequest marketSellRequest) {
        Long userId = (Long) request.getAttribute(USER_ID);
        return orderService.marketSell(userId, marketSellRequest);
    }

    @PostMapping("/limit-buy")
    public LimitBuyResponse limitBuy(HttpServletRequest request, @Valid @RequestBody LimitBuyRequest limitBuyRequest) {
        Long userId = (Long) request.getAttribute(USER_ID);
        return orderService.limitBuy(userId, limitBuyRequest);
    }

    @PostMapping("/limit-sell")
    public LimitSellResponse limitSell(HttpServletRequest request, @Valid @RequestBody LimitSellRequest limitSellRequest) {
        Long userId = (Long) request.getAttribute(USER_ID);
        return orderService.limitSell(userId, limitSellRequest);
    }

    @DeleteMapping("/limit/{orderId}")
    public CancelLimitOrderResponse cancelLimitOrder(HttpServletRequest request, @PathVariable Long orderId) {
        Long userId = (Long) request.getAttribute(USER_ID);
        return orderService.cancelLimitOrder(userId, orderId);
    }

    @GetMapping("/limit/pending")
    public List<PendingLimitOrderResponse> getPendingLimitOrders(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(USER_ID);
        return orderService.getPendingLimitOrders(userId);
    }

    @GetMapping("/trade-histories")
    public TradeHistoryCursorResponse getTradeHistories(
            HttpServletRequest request,
            @RequestParam(required = false) Long cursorId,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = (Long) request.getAttribute(USER_ID);
        return orderService.getTradeHistories(userId, cursorId, size);
    }
}
