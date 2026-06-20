package com.sangyunpark.backend.market.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record TickerResponse(
        String code,
        String market,

        @JsonProperty("trade_price")
        BigDecimal tradePrice,

        @JsonProperty("signed_change_rate")
        BigDecimal signedChangeRate,

        @JsonProperty("signed_change_price")
        BigDecimal signedChangePrice,

        @JsonProperty("high_price")
        BigDecimal highPrice,

        @JsonProperty("low_price")
        BigDecimal lowPrice,

        @JsonProperty("acc_trade_volume_24h")
        BigDecimal accTradeVolume24h,

        @JsonProperty("acc_trade_price_24h")
        BigDecimal accTradePrice24h,

        @JsonProperty("prev_closing_price")
        BigDecimal prevClosingPrice,

        @JsonProperty("highest_52_week_price")
        BigDecimal highest52WeekPrice,

        @JsonProperty("highest_52_week_date")
        String highest52WeekDate,

        @JsonProperty("lowest_52_week_price")
        BigDecimal lowest52WeekPrice,

        @JsonProperty("lowest_52_week_date")
        String lowest52WeekDate,

        @JsonProperty("acc_bid_volume")
        BigDecimal accBidVolume,

        @JsonProperty("acc_ask_volume")
        BigDecimal accAskVolume,

        Long timestamp
) {

    public String marketCode() {
        return code != null ? code : market;
    }
}
