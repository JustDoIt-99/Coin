package com.sangyunpark.backend.market.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record TradeResponse(
        String code,

        @JsonProperty("trade_price")
        BigDecimal tradePrice,

        @JsonProperty("trade_volume")
        BigDecimal tradeVolume,

        @JsonProperty("ask_bid")
        String askBid,

        @JsonProperty("trade_timestamp")
        Long tradeTimestamp
) {
}
