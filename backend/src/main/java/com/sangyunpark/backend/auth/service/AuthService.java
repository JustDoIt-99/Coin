package com.sangyunpark.backend.auth.service;

import com.sangyunpark.backend.asset.entity.Asset;
import com.sangyunpark.backend.asset.repository.AssetJpaRepository;
import com.sangyunpark.backend.auth.dto.response.*;
import com.sangyunpark.backend.auth.entity.RefreshToken;
import com.sangyunpark.backend.auth.dto.request.LoginRequest;
import com.sangyunpark.backend.auth.dto.request.SignupRequest;
import com.sangyunpark.backend.auth.exception.AuthErrorCode;
import com.sangyunpark.backend.auth.jwt.JwtTokenProvider;
import com.sangyunpark.backend.auth.repositiory.RefreshTokenJpaRepository;
import com.sangyunpark.backend.common.exception.BusinessException;
import com.sangyunpark.backend.user.dto.response.UserResponse;
import com.sangyunpark.backend.user.entity.User;
import com.sangyunpark.backend.user.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String INITIAL_CASH_ASSET_CODE = "KRW";
    private static final BigDecimal INITIAL_CASH_BALANCE = new BigDecimal("1000000");

    private final UserJpaRepository userJpaRepository;
    private final AssetJpaRepository assetJpaRepository;
    private final RefreshTokenJpaRepository refreshTokenJpaRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthTokenResponse signup(final SignupRequest request) {
        if(userJpaRepository.existsByEmail(request.email())) {
            throw new BusinessException(AuthErrorCode.DUPLICATE_EMAIL);
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .nickname(request.nickname())
                .build();

        User savedUser = userJpaRepository.save(user);
        assetJpaRepository.save(
                Asset.createWithBalance(savedUser, INITIAL_CASH_ASSET_CODE, INITIAL_CASH_BALANCE)
        );

        String accessToken = jwtTokenProvider.createAccessToken(savedUser.getId());
        String refreshToken = jwtTokenProvider.createRefreshToken(savedUser.getId());

        return new AuthTokenResponse(
            accessToken,
            refreshToken,
            UserResponse.from(user)
        );
    }

    @Transactional
    public AuthTokenResponse login(final LoginRequest request) {
        User user = userJpaRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(AuthErrorCode.INVALID_LOGIN_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException(AuthErrorCode.INVALID_LOGIN_CREDENTIALS);
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

        return new AuthTokenResponse(
                accessToken,
                refreshToken,
                UserResponse.from(user)
        );
    }

    @Transactional
    public AuthTokenResponse reissue(String refreshToken) {

        if(!jwtTokenProvider.validate(refreshToken)) {
            throw new BusinessException(AuthErrorCode.INVALID_REFRESH_TOKEN);
        }

        RefreshToken savedToken = refreshTokenJpaRepository.findByToken(refreshToken)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.INVALID_REFRESH_TOKEN));

        if(savedToken.isExpired()) {
            throw new BusinessException(AuthErrorCode.EXPIRED_REFRESH_TOKEN);
        }

        User user = savedToken.getUser();
        String accessToken = jwtTokenProvider.createAccessToken(user.getId());
        String rotatedRefreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        refreshTokenJpaRepository.deleteByUser(user);
        refreshTokenJpaRepository.save(
                RefreshToken.builder()
                        .user(user)
                        .token(rotatedRefreshToken)
                        .expiredAt(LocalDateTime.now().plusDays(14))
                        .build()
        );

        return new AuthTokenResponse(
                accessToken,
                rotatedRefreshToken,
                UserResponse.from(user)
        );
    }

    @Transactional
    public void logout(Long userId) {
        User user = userJpaRepository.findById(userId).orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));
        refreshTokenJpaRepository.deleteByUser(user);
    }

    @Transactional(readOnly = true)
    public UserResponse me(Long userId) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        return UserResponse.from(user);
    }
}
