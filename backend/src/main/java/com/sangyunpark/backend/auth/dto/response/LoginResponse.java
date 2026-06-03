package com.sangyunpark.backend.auth.dto.response;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        UserResponse userResponse
) {
}
