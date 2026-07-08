package com.sangyunpark.backend.order.controller.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record MarketBuyRequest(
        @NotBlank
        @Pattern(regexp = "^[A-Z0-9]+-[A-Z0-9]+$")
        String marketCode,

        @NotNull
        @DecimalMin(value = "5000.0")
        BigDecimal amount
) {
}
