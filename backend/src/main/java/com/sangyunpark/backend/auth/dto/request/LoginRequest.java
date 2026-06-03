package com.sangyunpark.backend.auth.dto.request;

public record LoginRequest(
        String email,
        String password
) {
}
