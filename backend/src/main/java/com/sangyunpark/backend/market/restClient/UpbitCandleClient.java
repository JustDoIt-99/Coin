package com.sangyunpark.backend.market.restClient;

import com.sangyunpark.backend.common.exception.BusinessException;
import com.sangyunpark.backend.market.dto.response.CandleResponse;
import com.sangyunpark.backend.market.exception.MarketErrorCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriBuilder;

import java.util.Arrays;
import java.util.List;

@Component
public class UpbitCandleClient {

    private static final String UPBIT_URL = "https://api.upbit.com/v1";

    private final RestClient restClient = RestClient.builder()
            .baseUrl(UPBIT_URL)
            .build();

    public List<CandleResponse> fetchMinuteCandles(String market, int unit, int count, String to) {
        try {
            CandleResponse[] response = restClient.get()
                    .uri(uriBuilder -> {
                        UriBuilder builder = uriBuilder
                                .path("/candles/minutes/{unit}")
                                .queryParam("market", market)
                                .queryParam("count", count);

                        if(to != null && !to.isBlank()) {
                            builder.queryParam("to", to);
                        }

                        return builder.build(unit);
                    })
                    .retrieve()
                    .body(CandleResponse[].class);

            return response == null ? List.of() : Arrays.asList(response);
        } catch (HttpClientErrorException.TooManyRequests e) {
            throw new BusinessException(MarketErrorCode.UPBIT_RATE_LIMIT);
        } catch (Exception e) {
            throw new BusinessException(MarketErrorCode.UPBIT_API_ERROR);
        }
    }
}
