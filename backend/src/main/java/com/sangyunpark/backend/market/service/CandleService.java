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

    @Cacheable(value = "candles", key = "#market + ':days:' + #count + ':' + (#to == null ? 'latest' : #to)")
    public List<CandleResponse> getDayCandles(String market, int count, String to) {
        return upbitCandleClient.fetchDayCandles(market, count, to);
    }

    @Cacheable(value = "candles", key = "#market + ':weeks:' + #count + ':' + (#to == null ? 'latest' : #to)")
    public List<CandleResponse> getWeekCandles(String market, int count, String to) {
        return upbitCandleClient.fetchWeekCandles(market, count, to);
    }

    @Cacheable(value = "candles", key = "#market + ':months:' + #count + ':' + (#to == null ? 'latest' : #to)")
    public List<CandleResponse> getMonthCandles(String market, int count, String to) {
        return upbitCandleClient.fetchMonthCandles(market, count, to);
    }
}
