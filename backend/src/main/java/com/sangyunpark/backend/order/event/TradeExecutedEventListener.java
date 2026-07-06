package com.sangyunpark.backend.order.event;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class TradeExecutedEventListener {

    private static final String TRADE_TOPIC_PREFIX = "/topic/trades/";

    private final SimpMessagingTemplate messagingTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendTradeExecutedMessageAfterCommit(TradeExecutedEvent event) {
        messagingTemplate.convertAndSend(
                TRADE_TOPIC_PREFIX + event.userId(),
                TradeExecutedMessage.from(event)
        );
    }
}
