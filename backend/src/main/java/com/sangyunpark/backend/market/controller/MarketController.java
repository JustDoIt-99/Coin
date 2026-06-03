package com.sangyunpark.backend.market.controller;

import com.sangyunpark.backend.market.dto.response.MarketResponse;
import com.sangyunpark.backend.market.service.MarketService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/markets")
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;

    @GetMapping
    public List<MarketResponse> getMarkets() {
        return marketService.getMarkets();
    }
}
