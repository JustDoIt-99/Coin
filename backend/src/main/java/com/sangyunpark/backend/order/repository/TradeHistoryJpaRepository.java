package com.sangyunpark.backend.order.repository;

import com.sangyunpark.backend.order.entity.TradeHistory;
import com.sangyunpark.backend.user.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TradeHistoryJpaRepository extends JpaRepository<TradeHistory, Long> {

    List<TradeHistory> findByUserOrderByIdDesc(User user, Pageable pageable);

    List<TradeHistory> findByUserAndIdLessThanOrderByIdDesc(User user, Long id, Pageable pageable);
}
