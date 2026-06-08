package com.sangyunpark.backend.market.controller;

import com.sangyunpark.backend.market.service.OrderbookSubscriptionService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orderbooks")
public class OrderBookController {

    private final OrderbookSubscriptionService orderbookSubscriptionService;

    @PostMapping("/subscribe")
    public void subscribe(@RequestParam @NotBlank String marketCode) {
        orderbookSubscriptionService.subscription(marketCode);
    }
}
