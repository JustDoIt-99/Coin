package com.sangyunpark.backend.order.event;

import com.sangyunpark.backend.order.service.PendingLimitOrderIndex;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class LimitOrderCacheEventListener {

    private final PendingLimitOrderIndex pendingLimitOrderIndex;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(LimitBuyOrderCreatedEvent event) {
        pendingLimitOrderIndex.updateBuyLimitPrice(event.marketCode(), event.limitPrice());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(LimitOrderCancelledEvent event) {
        pendingLimitOrderIndex.refreshBuyLimitPrice(event.marketCode());
    }
}
