package com.sangyunpark.backend.market.controller;

import com.sangyunpark.backend.market.dto.response.TickerResponse;
import com.sangyunpark.backend.market.service.TickerService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api/tickers")
@RequiredArgsConstructor
public class TickerController {

    private final TickerService tickerService;

    @GetMapping
    public List<TickerResponse> getTickers(
            @RequestParam
            @NotBlank(message = "마켓 목록은 필수입니다.")
            String markets
    ) {
        List<String> marketCodes = Arrays.stream(markets.split(","))
                .map(String::trim)
                .filter(code -> !code.isBlank())
                .toList();

        return tickerService.getLatestTickers(marketCodes);
    }
}
