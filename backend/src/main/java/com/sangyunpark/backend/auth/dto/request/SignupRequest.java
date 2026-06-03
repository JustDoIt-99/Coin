package com.sangyunpark.backend.auth.dto.request;

public record SignupRequest(
        String email,
        String password,
        String nickname
) {
}
