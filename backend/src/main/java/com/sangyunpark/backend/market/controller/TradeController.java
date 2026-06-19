package com.sangyunpark.backend.market.controller;

import com.sangyunpark.backend.market.service.TradeSubscriptionService;
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
@RequestMapping("/api/trades")
public class TradeController {

    private final TradeSubscriptionService tradeSubscriptionService;

    @PostMapping("/subscribe")
    public void subscribe(@RequestParam @NotBlank String marketCode) {
        tradeSubscriptionService.subscribe(marketCode);
    }
}
