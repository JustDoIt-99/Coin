package com.sangyunpark.backend.asset.repository;

import com.sangyunpark.backend.asset.entity.AssetTransferRequest;
import com.sangyunpark.backend.asset.entity.AssetTransferStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AssetTransferRequestJpaRepository extends JpaRepository<AssetTransferRequest, Long> {

    List<AssetTransferRequest> findByUserIdAndStatusInOrderByIdDesc(
            Long userId,
            List<AssetTransferStatus> statuses
    );

    List<AssetTransferRequest> findByStatusInOrderByIdDesc(List<AssetTransferStatus> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select r
            from AssetTransferRequest r
            where r.id = :id
            """)
    Optional<AssetTransferRequest> findForUpdateById(@Param("id") Long id);
}
