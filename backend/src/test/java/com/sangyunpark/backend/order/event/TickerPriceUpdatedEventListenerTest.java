package com.sangyunpark.backend.order.event;

import com.sangyunpark.backend.market.event.TickerPriceUpdatedEvent;
import com.sangyunpark.backend.order.service.LimitOrderExecutionService;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class TickerPriceUpdatedEventListenerTest {

    @Test
    void ticker_현재가_이벤트가_발생하면_지정가_매수와_매도_체결을_모두_시도한다() {
        LimitOrderExecutionService limitOrderExecutionService = mock(LimitOrderExecutionService.class);
        TickerPriceUpdatedEventListener listener = new TickerPriceUpdatedEventListener(limitOrderExecutionService);
        TickerPriceUpdatedEvent event = new TickerPriceUpdatedEvent(
                "KRW-BTC",
                new BigDecimal("50000000"),
                1_719_000_000_000L
        );

        listener.handle(event);

        verify(limitOrderExecutionService).executePendingBuyOrders("KRW-BTC", new BigDecimal("50000000"));
        verify(limitOrderExecutionService).executePendingSellOrders("KRW-BTC", new BigDecimal("50000000"));
    }
}
