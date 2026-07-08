package com.sangyunpark.backend.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sangyunpark.backend.auth.dto.request.LoginRequest;
import com.sangyunpark.backend.auth.dto.request.SignupRequest;
import com.sangyunpark.backend.auth.dto.response.AuthTokenResponse;
import com.sangyunpark.backend.auth.service.AuthService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    AuthService authService;

    @Test
    void 회원가입_성공() throws Exception {
        SignupRequest request = new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        );

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.user.id").exists())
                .andExpect(jsonPath("$.user.email").value("test@test.com"))
                .andExpect(jsonPath("$.user.nickname").value("sangyun"))
                .andExpect(cookie().exists("refreshToken"));
    }

    @Test
    void 로그인_성공() throws Exception {
        authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));

        LoginRequest request = new LoginRequest(
                "test@test.com",
                "12345678"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(cookie().exists("refreshToken"))
                .andExpect(cookie().httpOnly("refreshToken", true))
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(jsonPath("$.user.email").value("test@test.com"))
                .andExpect(jsonPath("$.user.nickname").value("sangyun"));
    }

    @Test
    void 로그인_실패() throws Exception {
        LoginRequest request = new LoginRequest(
                "none@test.com",
                "12345678"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void 액세스_토큰_재발급_성공() throws Exception {
        authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));

        AuthTokenResponse authTokenResponse = authService.login(new LoginRequest(
                "test@test.com",
                "12345678"
        ));

        mockMvc.perform(post("/api/auth/reissue")
                        .cookie(new Cookie("refreshToken", authTokenResponse.refreshToken())))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("refreshToken"))
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.user.email").value("test@test.com"))
                .andExpect(jsonPath("$.user.nickname").value("sangyun"));
    }

    @Test
    void 잘못된_리프레시_토큰으로_재발급하면_실패한다() throws Exception {
        mockMvc.perform(post("/api/auth/reissue")
                        .cookie(new Cookie("refreshToken", "invalid-refresh-token")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void 로그아웃_성공() throws Exception {
        authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));

        AuthTokenResponse authTokenResponse = authService.login(new LoginRequest(
                "test@test.com",
                "12345678"
        ));

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + authTokenResponse.accessToken())
                        .cookie(new Cookie("refreshToken", authTokenResponse.refreshToken())))
                .andExpect(status().isOk())
                .andExpect(cookie().value("refreshToken", ""))
                .andExpect(cookie().maxAge("refreshToken", 0))
                .andExpect(cookie().httpOnly("refreshToken", true));
    }

    @Test
    void 로그아웃_preflight_요청은_인증_없이_통과한다() throws Exception {
        mockMvc.perform(options("/api/auth/logout")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }
}
