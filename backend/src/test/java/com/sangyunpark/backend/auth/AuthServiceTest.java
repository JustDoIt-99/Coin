package com.sangyunpark.backend.auth;

import com.sangyunpark.backend.auth.dto.request.LoginRequest;
import com.sangyunpark.backend.auth.dto.request.SignupRequest;
import com.sangyunpark.backend.auth.dto.response.LoginResponse;
import com.sangyunpark.backend.auth.dto.response.ReissueResponse;
import com.sangyunpark.backend.auth.dto.response.UserResponse;
import com.sangyunpark.backend.auth.exception.AuthErrorCode;
import com.sangyunpark.backend.auth.repositiory.RefreshTokenJpaRepository;
import com.sangyunpark.backend.auth.repositiory.UserJpaRepository;
import com.sangyunpark.backend.auth.service.AuthService;
import com.sangyunpark.backend.common.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
class AuthServiceTest {

    @Autowired
    AuthService authService;

    @Autowired
    UserJpaRepository userJpaRepository;

    @Autowired
    RefreshTokenJpaRepository refreshTokenJpaRepository;

    @Test
    void 회원가입_성공() {
        SignupRequest request = new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        );

        UserResponse response = authService.signup(request);

        assertThat(response.id()).isNotNull();
        assertThat(response.email()).isEqualTo("test@test.com");
        assertThat(response.nickname()).isEqualTo("sangyun");
        assertThat(userJpaRepository.existsByEmail("test@test.com")).isTrue();
    }

    @Test
    void 중복_이메일로_회원가입하면_예외가_발생한다() {
        SignupRequest request = new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        );

        authService.signup(request);

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(AuthErrorCode.DUPLICATE_EMAIL);
    }

    @Test
    void 로그인_성공() {
        authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));

        LoginResponse response = authService.login(new LoginRequest(
                "test@test.com",
                "12345678"
        ));

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
        assertThat(response.userResponse().email()).isEqualTo("test@test.com");
        assertThat(response.userResponse().nickname()).isEqualTo("sangyun");
    }

    @Test
    void 존재하지_않는_이메일로_로그인하면_예외가_발생한다() {
        LoginRequest request = new LoginRequest(
                "none@test.com",
                "12345678"
        );

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(AuthErrorCode.INVALID_LOGIN_CREDENTIALS);
    }

    @Test
    void 비밀번호가_일치하지_않으면_로그인에_실패한다() {
        authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));

        LoginRequest request = new LoginRequest(
                "test@test.com",
                "wrong-password"
        );

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(AuthErrorCode.INVALID_LOGIN_CREDENTIALS);
    }

    @Test
    void 로그인하면_리프레시_토큰이_DB에_저장된다() {
        authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));

        LoginResponse response = authService.login(new LoginRequest(
                "test@test.com",
                "12345678"
        ));

        assertThat(refreshTokenJpaRepository.findByToken(response.refreshToken()))
                .isPresent();
    }

    @Test
    void 다시_로그인하면_기존_리프레시_토큰은_삭제되고_새_토큰만_저장된다() {
        authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));

        LoginResponse firstLogin = authService.login(new LoginRequest(
                "test@test.com",
                "12345678"
        ));

        LoginResponse secondLogin = authService.login(new LoginRequest(
                "test@test.com",
                "12345678"
        ));

        assertThat(refreshTokenJpaRepository.findByToken(firstLogin.refreshToken()))
                .isEmpty();

        assertThat(refreshTokenJpaRepository.findByToken(secondLogin.refreshToken()))
                .isPresent();
    }

    @Test
    void 리프레시_토큰으로_액세스_토큰을_재발급한다() {
        authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));

        LoginResponse loginResponse = authService.login(new LoginRequest(
                "test@test.com",
                "12345678"
        ));

        ReissueResponse response = authService.reissue(loginResponse.refreshToken());

        assertThat(response.accessToken()).isNotBlank();
    }

    @Test
    void 존재하지_않는_리프레시_토큰으로_재발급하면_예외가_발생한다() {
        assertThatThrownBy(() -> authService.reissue("invalid-refresh-token"))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(AuthErrorCode.INVALID_REFRESH_TOKEN);
    }

    @Test
    void 로그아웃하면_리프레시_토큰이_삭제된다() {
        UserResponse user = authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));

        LoginResponse loginResponse = authService.login(new LoginRequest(
                "test@test.com",
                "12345678"
        ));

        authService.logout(user.id());

        assertThat(
                refreshTokenJpaRepository.findByToken(
                        loginResponse.refreshToken()
                )
        ).isEmpty();
    }

    @Test
    void 내_정보를_조회한다() {
        UserResponse signupResponse = authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));

        UserResponse response = authService.me(signupResponse.id());

        assertThat(response.id()).isEqualTo(signupResponse.id());
        assertThat(response.email()).isEqualTo("test@test.com");
        assertThat(response.nickname()).isEqualTo("sangyun");
    }
}