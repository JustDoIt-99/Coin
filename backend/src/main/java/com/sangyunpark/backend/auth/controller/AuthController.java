package com.sangyunpark.backend.auth.controller;

import com.sangyunpark.backend.auth.dto.request.LoginRequest;
import com.sangyunpark.backend.auth.dto.request.LogoutRequest;
import com.sangyunpark.backend.auth.dto.request.ReissueRequest;
import com.sangyunpark.backend.auth.dto.request.SignupRequest;
import com.sangyunpark.backend.auth.dto.response.LoginResponse;
import com.sangyunpark.backend.auth.dto.response.ReissueResponse;
import com.sangyunpark.backend.auth.dto.response.UserResponse;
import com.sangyunpark.backend.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String USER_ID = "userId";

    private final AuthService authService;

    @PostMapping("/signup")
    public UserResponse signup(@RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/reissue")
    public ReissueResponse reissue(@RequestBody ReissueRequest request) {
        return authService.reissue(
                request.refreshToken()
        );
    }

    @PostMapping("/logout")
    public void logout(@RequestBody LogoutRequest request) {
        authService.logout(request.refreshToken());
    }

    @GetMapping("/me")
    public UserResponse me(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(USER_ID);
        return authService.me(userId);
    }
}
