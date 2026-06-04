package com.sangyunpark.backend.market.service;

import com.sangyunpark.backend.market.dto.response.CandleResponse;
import com.sangyunpark.backend.market.restClient.UpbitCandleClient;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CandleService {

    private final UpbitCandleClient upbitCandleClient;

    @Cacheable(value = "candles", key = "#market + ':' + #unit + ':' + #count + ':' + (#to == null ? 'latest' : #to)")
    public List<CandleResponse> getMinuteCandles(String market, int unit, int count, String to) {
        return upbitCandleClient.fetchMinuteCandles(market, unit, count, to);
    }
}
