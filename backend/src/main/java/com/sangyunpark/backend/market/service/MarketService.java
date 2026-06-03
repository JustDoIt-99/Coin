package com.sangyunpark.backend.market.service;

import com.sangyunpark.backend.market.dto.response.MarketResponse;
import com.sangyunpark.backend.market.restClient.UpbitMarketClient;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketService {

    private final UpbitMarketClient upbitMarketClient;

    @Cacheable("markets")
    public List<MarketResponse> getMarkets() {
        return upbitMarketClient.fetchMarkets();
    }
}
