package com.sangyunpark.backend.market.restClient;

import com.sangyunpark.backend.common.exception.BusinessException;
import com.sangyunpark.backend.market.dto.response.OrderbookResponse;
import com.sangyunpark.backend.market.exception.MarketErrorCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.Arrays;

@Component
public class UpbitOrderbookClient {

    private static final String UPBIT_URL = "https://api.upbit.com/v1";

    private final RestClient restClient = RestClient.builder()
            .baseUrl(UPBIT_URL)
            .build();

    public OrderbookResponse fetchOrderbook(String marketCode) {
        try {
            OrderbookResponse[] response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/orderbook")
                            .queryParam("markets", marketCode)
                            .build()
                    )
                    .retrieve()
                    .body(OrderbookResponse[].class);

            return Arrays.stream(response == null ? new OrderbookResponse[0] : response)
                    .findFirst()
                    .orElseThrow(() -> new BusinessException(MarketErrorCode.MARKET_NOT_FOUND));
        } catch (HttpClientErrorException.TooManyRequests e) {
            throw new BusinessException(MarketErrorCode.UPBIT_RATE_LIMIT);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(MarketErrorCode.UPBIT_API_ERROR);
        }
    }
}
