package com.sangyunpark.backend.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sangyunpark.backend.auth.dto.request.LoginRequest;
import com.sangyunpark.backend.auth.dto.request.LogoutRequest;
import com.sangyunpark.backend.auth.dto.request.ReissueRequest;
import com.sangyunpark.backend.auth.dto.request.SignupRequest;
import com.sangyunpark.backend.auth.dto.response.LoginResponse;
import com.sangyunpark.backend.auth.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
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
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.email").value("test@test.com"))
                .andExpect(jsonPath("$.nickname").value("sangyun"));
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
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.userResponse.email").value("test@test.com"))
                .andExpect(jsonPath("$.userResponse.nickname").value("sangyun"));
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

        LoginResponse loginResponse = authService.login(new LoginRequest(
                "test@test.com",
                "12345678"
        ));

        ReissueRequest request = new ReissueRequest(
                loginResponse.refreshToken()
        );

        mockMvc.perform(post("/api/auth/reissue")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
    }

    @Test
    void 잘못된_리프레시_토큰으로_재발급하면_실패한다() throws Exception {
        ReissueRequest request = new ReissueRequest(
                "invalid-refresh-token"
        );

        mockMvc.perform(post("/api/auth/reissue")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void 로그아웃_성공() throws Exception {
        authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));

        LoginResponse loginResponse = authService.login(new LoginRequest(
                "test@test.com",
                "12345678"
        ));

        LogoutRequest request = new LogoutRequest(
                loginResponse.refreshToken()
        );

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + loginResponse.accessToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}