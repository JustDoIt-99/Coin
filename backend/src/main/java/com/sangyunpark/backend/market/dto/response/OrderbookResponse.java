package com.sangyunpark.backend.market.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

public record OrderbookResponse(
        String code,

        Long timestamp,

        @JsonProperty("total_ask_size")
        BigDecimal totalAskSize,

        @JsonProperty("total_bid_size")
        BigDecimal totalBidSize,

        @JsonProperty("orderbook_units")
        List<OrderBookUnitResponse> orderbookUnits
) {

    public record OrderBookUnitResponse(
            @JsonProperty("ask_price")
            BigDecimal askPrice,

            @JsonProperty("bid_price")
            BigDecimal bidPrice,

            @JsonProperty("ask_size")
            BigDecimal askSize,

            @JsonProperty("bid_size")
            BigDecimal bidSize
    ) {}
}
