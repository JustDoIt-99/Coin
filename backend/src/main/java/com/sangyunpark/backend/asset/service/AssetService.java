package com.sangyunpark.backend.asset.service;

import com.sangyunpark.backend.asset.controller.dto.response.AssetResponse;
import com.sangyunpark.backend.asset.repository.AssetJpaRepository;
import com.sangyunpark.backend.auth.exception.AuthErrorCode;
import com.sangyunpark.backend.common.exception.BusinessException;
import com.sangyunpark.backend.user.entity.User;
import com.sangyunpark.backend.user.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final UserJpaRepository userJpaRepository;
    private final AssetJpaRepository assetJpaRepository;

    @Transactional(readOnly = true)
    public List<AssetResponse> getAssets(Long userId) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.USER_NOT_FOUND));

        return assetJpaRepository.findByUserOrderByAssetCodeAsc(user)
                .stream()
                .map(AssetResponse::from)
                .toList();
    }
}
