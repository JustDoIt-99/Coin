package com.sangyunpark.backend.market.restClient;

import com.sangyunpark.backend.common.exception.BusinessException;
import com.sangyunpark.backend.market.dto.response.TickerResponse;
import com.sangyunpark.backend.market.exception.MarketErrorCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.List;

@Component
public class UpbitTickerClient {

    private static final String UPBIT_URL = "https://api.upbit.com/v1";

    private final RestClient restClient = RestClient.builder()
            .baseUrl(UPBIT_URL)
            .build();

    public List<TickerResponse> fetchTickers(List<String> marketCodes) {

        if(marketCodes == null || marketCodes.isEmpty()) {
            return List.of();
        }

        try {
            TickerResponse[] response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/ticker")
                            .queryParam("markets", String.join(",", marketCodes))
                            .build()
                    )
                    .retrieve()
                    .body(TickerResponse[].class);
            return response == null ? List.of() : Arrays.asList(response);

        } catch (HttpClientErrorException.TooManyRequests e) {
            throw new BusinessException(MarketErrorCode.UPBIT_RATE_LIMIT);
        } catch (Exception e) {
            throw new BusinessException(MarketErrorCode.UPBIT_API_ERROR);
        }
    }
}
