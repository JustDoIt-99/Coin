package com.sangyunpark.backend.auth.dto.request;

public record LogoutRequest(
        String refreshToken
) {
}
