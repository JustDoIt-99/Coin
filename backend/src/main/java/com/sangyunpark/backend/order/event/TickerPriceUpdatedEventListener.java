package com.sangyunpark.backend.order.event;

import com.sangyunpark.backend.common.config.AsyncConfig;
import com.sangyunpark.backend.market.event.TickerPriceUpdatedEvent;
import com.sangyunpark.backend.order.service.LimitOrderExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TickerPriceUpdatedEventListener {

    private final LimitOrderExecutionService limitOrderExecutionService;

    @Async(AsyncConfig.LIMIT_ORDER_EXECUTION_EXECUTOR)
    @EventListener
    public void handle(TickerPriceUpdatedEvent event) {
        limitOrderExecutionService.executePendingBuyOrders(event.marketCode(), event.tradePrice());
    }
}
