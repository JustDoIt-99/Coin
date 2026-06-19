package com.sangyunpark.backend.auth.dto.response;

public record AuthResponse(
        String accessToken,
        UserResponse user
) {
}
