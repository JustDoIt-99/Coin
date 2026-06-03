package com.sangyunpark.backend.market;

import com.sangyunpark.backend.market.dto.response.MarketResponse;
import com.sangyunpark.backend.market.restClient.UpbitMarketClient;
import com.sangyunpark.backend.market.service.MarketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@SpringBootTest
class MarketServiceTest {

    @Autowired
    private MarketService marketService;

    @MockitoBean
    private UpbitMarketClient upbitMarketClient;

    @Test
    void 시장목록은_캐시된다() {

        List<MarketResponse> markets = List.of(
                new MarketResponse(
                        "KRW-BTC",
                        "비트코인",
                        "Bitcoin"
                )
        );

        given(upbitMarketClient.fetchMarkets())
                .willReturn(markets);

        marketService.getMarkets();
        marketService.getMarkets();
        marketService.getMarkets();

        verify(upbitMarketClient, times(1))
                .fetchMarkets();
    }
}
