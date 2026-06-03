package com.sangyunpark.backend.market.controller;

import com.sangyunpark.backend.market.dto.response.CandleResponse;
import com.sangyunpark.backend.market.service.CandleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candles")
@RequiredArgsConstructor
public class CandleController {

    private final CandleService candleService;

    @GetMapping("/minutes/{unit}")
    public List<CandleResponse> getMinuteCandles(
            @PathVariable int unit,
            @RequestParam String market,
            @RequestParam(defaultValue = "200") int count,
            @RequestParam(required = false) String to
    ) {
        return candleService.getMinuteCandles(market, unit, count, to);
    }

}
