package com.sangyunpark.backend.order.repository;

import com.sangyunpark.backend.order.entity.LimitOrder;
import com.sangyunpark.backend.order.entity.OrderStatus;
import com.sangyunpark.backend.order.entity.OrderType;
import com.sangyunpark.backend.order.entity.TradeSide;
import com.sangyunpark.backend.user.entity.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LimitOrderJpaRepository extends JpaRepository<LimitOrder, Long> {

    Optional<LimitOrder> findByIdAndUser(Long id, User user);

    List<LimitOrder> findByUserAndOrderTypeAndStatusInOrderByIdDesc(
            User user,
            OrderType orderType,
            List<OrderStatus> statuses
    );

    @Query("""
            select o
            from LimitOrder o
            where o.marketCode = :marketCode
              and o.tradeSide = :tradeSide
              and o.orderType = :orderType
              and o.status = :status
              and o.limitPrice >= :currentPrice
            order by o.id asc
            """)
    List<LimitOrder> findExecutableBuyOrders(
            String marketCode,
            TradeSide tradeSide,
            OrderType orderType,
            OrderStatus status,
            BigDecimal currentPrice,
            Pageable pageable
    );

    @Query("""
            select o
            from LimitOrder o
            where o.marketCode = :marketCode
              and o.tradeSide = :tradeSide
              and o.orderType = :orderType
              and o.status = :status
              and o.limitPrice <= :currentPrice
            order by o.id asc
            """)
    List<LimitOrder> findExecutableSellOrders(
            String marketCode,
            TradeSide tradeSide,
            OrderType orderType,
            OrderStatus status,
            BigDecimal currentPrice,
            Pageable pageable
    );

    @Query("""
            select o
            from LimitOrder o
            where o.marketCode = :marketCode
              and o.tradeSide = com.sangyunpark.backend.order.entity.TradeSide.BUY
              and o.orderType = com.sangyunpark.backend.order.entity.OrderType.LIMIT
              and o.status = com.sangyunpark.backend.order.entity.OrderStatus.PENDING
            order by o.limitPrice desc
            """)
    List<LimitOrder> findPendingBuyOrdersByHighestLimitPrice(
            @Param("marketCode") String marketCode,
            Pageable pageable
    );

    default Optional<LimitOrder> findHighestPendingBuyLimitOrder(String marketCode) {
        return findPendingBuyOrdersByHighestLimitPrice(marketCode, PageRequest.of(0, 1))
                .stream()
                .findFirst();
    }

    @Query("""
            select o
            from LimitOrder o
            where o.marketCode = :marketCode
              and o.tradeSide = com.sangyunpark.backend.order.entity.TradeSide.SELL
              and o.orderType = com.sangyunpark.backend.order.entity.OrderType.LIMIT
              and o.status = com.sangyunpark.backend.order.entity.OrderStatus.PENDING
            order by o.limitPrice asc
            """)
    List<LimitOrder> findPendingSellOrdersByLowestLimitPrice(
            @Param("marketCode") String marketCode,
            Pageable pageable
    );

    default Optional<LimitOrder> findLowestPendingSellLimitOrder(String marketCode) {
        return findPendingSellOrdersByLowestLimitPrice(marketCode, PageRequest.of(0, 1))
                .stream()
                .findFirst();
    }

    @Query("""
            select o
            from LimitOrder o
            where o.status = :status
              and o.updatedAt <= :updatedAt
            order by o.id asc
            """)
    List<LimitOrder> findRetryPendingOrders(
            @Param("status") OrderStatus status,
            @Param("updatedAt") LocalDateTime updatedAt,
            Pageable pageable
    );

    @Modifying(flushAutomatically = true)
    @Query("""
            update LimitOrder o
            set o.status = :nextStatus,
                o.updatedAt = CURRENT_TIMESTAMP
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
            set o.status = :nextStatus,
                o.updatedAt = CURRENT_TIMESTAMP
            where o.id = :orderId
              and o.user.id = :userId
              and o.status in :currentStatuses
            """)
    int updateStatusByUserIdInStatuses(
            @Param("orderId") Long orderId,
            @Param("userId") Long userId,
            @Param("currentStatuses") List<OrderStatus> currentStatuses,
            @Param("nextStatus") OrderStatus nextStatus
    );

    @Modifying(flushAutomatically = true)
    @Query("""
            update LimitOrder o
            set o.status = :filledStatus,
                o.executedQuantity = :executedQuantity,
                o.executedAmount = :executedAmount,
                o.updatedAt = CURRENT_TIMESTAMP
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
