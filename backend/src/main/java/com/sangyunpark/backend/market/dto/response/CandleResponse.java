package com.sangyunpark.backend.market.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record CandleResponse(

        String market,

        @JsonProperty("candle_date_time_utc")
        String candleDateTimeUtc,

        @JsonProperty("candle_date_time_kst")
        String candleDateTimeKst,

        @JsonProperty("opening_price")
        BigDecimal openingPrice,

        @JsonProperty("high_price")
        BigDecimal highPrice,

        @JsonProperty("low_price")
        BigDecimal lowPrice,

        @JsonProperty("trade_price")
        BigDecimal tradePrice,

        Long timestamp,

        @JsonProperty("candle_acc_trade_price")
        BigDecimal candleAccTradePrice,

        @JsonProperty("candle_acc_trade_volume")
        BigDecimal candleAccTradeVolume,

        Integer unit

){}
