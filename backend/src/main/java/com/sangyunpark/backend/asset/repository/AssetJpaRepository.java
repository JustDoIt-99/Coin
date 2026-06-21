package com.sangyunpark.backend.asset.repository;

import com.sangyunpark.backend.asset.entity.Asset;
import com.sangyunpark.backend.user.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

public interface AssetJpaRepository extends JpaRepository<Asset, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Asset> findByUserAndAssetCode(User user, String assetCode);
}
