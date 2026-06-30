package com.sangyunpark.backend.asset.controller.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CashDepositRequest(
        @NotNull
        @DecimalMax(value = "1000000000")
        @DecimalMin(value = "0.0", inclusive = false)
        BigDecimal amount
) {
}
