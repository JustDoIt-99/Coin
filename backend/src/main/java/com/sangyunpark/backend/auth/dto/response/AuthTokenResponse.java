package com.sangyunpark.backend.auth.dto.response;

import com.sangyunpark.backend.user.dto.response.UserResponse;

public record AuthTokenResponse(
        String accessToken,
        String refreshToken,
        UserResponse user
) {
}
