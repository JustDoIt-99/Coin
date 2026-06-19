package com.sangyunpark.backend.auth.dto.response;

public record LoginResponse(
        String accessToken,
        UserResponse user
) {
}
