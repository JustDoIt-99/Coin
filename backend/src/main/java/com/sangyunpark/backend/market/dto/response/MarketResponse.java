package com.sangyunpark.backend.market.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MarketResponse(
        String market,

        @JsonProperty("korean_name")
        String koreanName,

        @JsonProperty("english_name")
        String englishName
) {
}
