package com.sangyunpark.backend.asset.repository;

import com.sangyunpark.backend.asset.entity.AssetTransaction;
import com.sangyunpark.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetTransactionJpaRepository extends JpaRepository<AssetTransaction, Long> {

    List<AssetTransaction> findByUserOrderByIdAsc(User user);
}
