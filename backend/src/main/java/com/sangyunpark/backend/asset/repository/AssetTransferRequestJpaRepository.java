package com.sangyunpark.backend.asset.repository;

import com.sangyunpark.backend.asset.entity.AssetTransferRequest;
import com.sangyunpark.backend.asset.entity.AssetTransferStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetTransferRequestJpaRepository extends JpaRepository<AssetTransferRequest, Long> {

    List<AssetTransferRequest> findByUserIdAndStatusInOrderByIdDesc(
            Long userId,
            List<AssetTransferStatus> statuses
    );

    List<AssetTransferRequest> findByStatusInOrderByIdDesc(List<AssetTransferStatus> statuses);
}
