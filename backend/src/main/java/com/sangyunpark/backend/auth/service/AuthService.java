package com.sangyunpark.backend.auth.service;

import com.sangyunpark.backend.auth.dto.response.ReissueResponse;
import com.sangyunpark.backend.auth.entity.RefreshToken;
import com.sangyunpark.backend.auth.entity.User;
import com.sangyunpark.backend.auth.dto.request.LoginRequest;
import com.sangyunpark.backend.auth.dto.request.SignupRequest;
import com.sangyunpark.backend.auth.dto.response.LoginResponse;
import com.sangyunpark.backend.auth.dto.response.UserResponse;
import com.sangyunpark.backend.auth.exception.ErrorCode;
import com.sangyunpark.backend.auth.jwt.JwtTokenProvider;
import com.sangyunpark.backend.auth.repositiory.RefreshTokenJpaRepository;
import com.sangyunpark.backend.auth.repositiory.UserJpaRepository;
import com.sangyunpark.backend.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserJpaRepository userJpaRepository;
    private final RefreshTokenJpaRepository refreshTokenJpaRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse signup(final SignupRequest request) {
        if(userJpaRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .nickname(request.nickname())
                .build();

        User savedUser = userJpaRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getNickname()
        );
    }

    @Transactional
    public LoginResponse login(final LoginRequest request) {
        User user = userJpaRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_LOGIN_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_LOGIN_CREDENTIALS);
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getId());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        refreshTokenJpaRepository.deleteByUser(user);

        refreshTokenJpaRepository.save(
                RefreshToken.builder()
                        .user(user)
                        .token(refreshToken)
                        .expiredAt(LocalDateTime.now().plusDays(14))
                        .build()
        );

        return new LoginResponse(
                accessToken,
                refreshToken,
                UserResponse.from(user)
        );
    }

    @Transactional(readOnly = true)
    public ReissueResponse reissue(String refreshToken) {

        if(!jwtTokenProvider.validate(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        RefreshToken savedToken = refreshTokenJpaRepository.findByToken(refreshToken)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN));

        if(savedToken.isExpired()) {
            throw new BusinessException(ErrorCode.EXPIRED_REFRESH_TOKEN);
        }

        Long userId = jwtTokenProvider.getUserId(refreshToken);

        return new ReissueResponse(jwtTokenProvider.createAccessToken(userId));
    }

    @Transactional
    public void logout(Long userId) {
        User user = userJpaRepository.findById(userId).orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        refreshTokenJpaRepository.deleteByUser(user);
    }

    @Transactional(readOnly = true)
    public UserResponse me(Long userId) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        return UserResponse.from(user);
    }
}
