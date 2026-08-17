package com.sangyunpark.backend.common.logging.dto.request;

import jakarta.validation.constraints.NotNull;

public record LogTestRequest(
        @NotNull
        String level,
        String message
) {
}
