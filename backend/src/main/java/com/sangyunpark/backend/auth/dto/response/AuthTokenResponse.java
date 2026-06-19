package com.sangyunpark.backend.auth.dto.response;

public record AuthTokenResponse(
        String accessToken,
        String refreshToken,
        UserResponse user
) {
}
