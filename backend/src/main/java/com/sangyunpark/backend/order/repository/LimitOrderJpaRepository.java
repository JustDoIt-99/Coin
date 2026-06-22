package com.sangyunpark.backend.order.repository;

import com.sangyunpark.backend.order.entity.LimitOrder;
import com.sangyunpark.backend.order.entity.OrderStatus;
import com.sangyunpark.backend.order.entity.OrderType;
import com.sangyunpark.backend.order.entity.TradeSide;
import com.sangyunpark.backend.user.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface LimitOrderJpaRepository extends JpaRepository<LimitOrder, Long> {

    Optional<LimitOrder> findByIdAndUser(Long id, User user);

    List<LimitOrder> findByMarketCodeAndTradeSideAndOrderTypeAndStatusAndLimitPriceGreaterThanEqualOrderByIdAsc(
            String marketCode,
            TradeSide tradeSide,
            OrderType orderType,
            OrderStatus status,
            BigDecimal currentPrice,
            Pageable pageable
    );

    Optional<LimitOrder> findFirstByMarketCodeAndTradeSideAndOrderTypeAndStatusOrderByLimitPriceDesc(
            String marketCode,
            TradeSide tradeSide,
            OrderType orderType,
            OrderStatus status
    );

    @Modifying(flushAutomatically = true)
    @Query("""
            update LimitOrder o
            set o.status = :nextStatus
            where o.id = :orderId
              and o.status = :currentStatus
            """)
    int updateStatus(
            @Param("orderId") Long orderId,
            @Param("currentStatus") OrderStatus currentStatus,
            @Param("nextStatus") OrderStatus nextStatus
    );

    @Modifying(flushAutomatically = true)
    @Query("""
            update LimitOrder o
            set o.status = :nextStatus
            where o.id = :orderId
              and o.user.id = :userId
              and o.status = :currentStatus
            """)
    int updateStatusByUserId(
            @Param("orderId") Long orderId,
            @Param("userId") Long userId,
            @Param("currentStatus") OrderStatus currentStatus,
            @Param("nextStatus") OrderStatus nextStatus
    );

    @Modifying(flushAutomatically = true)
    @Query("""
            update LimitOrder o
            set o.status = :filledStatus,
                o.executedQuantity = :executedQuantity,
                o.executedAmount = :executedAmount
            where o.id = :orderId
              and o.status = :executingStatus
            """)
    int fillOrder(
            @Param("orderId") Long orderId,
            @Param("executingStatus") OrderStatus executingStatus,
            @Param("filledStatus") OrderStatus filledStatus,
            @Param("executedQuantity") BigDecimal executedQuantity,
            @Param("executedAmount") BigDecimal executedAmount
    );
}
