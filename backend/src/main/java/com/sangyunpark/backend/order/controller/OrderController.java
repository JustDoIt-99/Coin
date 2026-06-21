package com.sangyunpark.backend.order.controller;

import com.sangyunpark.backend.order.controller.dto.request.MarketBuyRequest;
import com.sangyunpark.backend.order.controller.dto.response.MarketBuyResponse;
import com.sangyunpark.backend.order.controller.dto.response.TradeHistoryCursorResponse;
import com.sangyunpark.backend.order.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
