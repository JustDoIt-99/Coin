package com.sangyunpark.backend.auth.controller;

import com.sangyunpark.backend.auth.dto.request.LoginRequest;
import com.sangyunpark.backend.auth.dto.request.SignupRequest;
import com.sangyunpark.backend.auth.dto.response.*;
import com.sangyunpark.backend.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String USER_ID = "userId";
    private static final String REFRESH_TOKEN = "refreshToken";
    private static final String REFRESH_TOKEN_PATH = "/api/auth/reissue";

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        AuthTokenResponse response = authService.signup(request);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createRefreshTokenCookie(response.refreshToken()).toString())
                .body(new AuthResponse(response.accessToken(), response.user()));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthTokenResponse result = authService.login(request);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createRefreshTokenCookie(result.refreshToken()).toString())
                .body(new LoginResponse(
                        result.accessToken(),
                        result.user()
                ));
    }

    @PostMapping("/reissue")
    public ResponseEntity<ReissueResponse> reissue(@CookieValue(REFRESH_TOKEN) String refreshToken) {
        AuthTokenResponse result = authService.reissue(refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createRefreshTokenCookie(result.refreshToken()).toString())
                .body(new ReissueResponse(
                        result.accessToken(),
                        result.user()
                ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(USER_ID);
        authService.logout(userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expireRefreshTokenCookie().toString())
                .build();
    }

    @GetMapping("/me")
    public UserResponse me(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(USER_ID);
        return authService.me(userId);
    }

    private ResponseCookie createRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from(REFRESH_TOKEN, refreshToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path(REFRESH_TOKEN_PATH)
                .maxAge(Duration.ofDays(14))
                .build();
    }

    private ResponseCookie expireRefreshTokenCookie() {
        return ResponseCookie.from(REFRESH_TOKEN, "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path(REFRESH_TOKEN_PATH)
                .maxAge(0)
                .build();
    }
}
