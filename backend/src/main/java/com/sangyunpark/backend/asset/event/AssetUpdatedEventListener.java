package com.sangyunpark.backend.asset.event;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class AssetUpdatedEventListener {

    private static final String ASSET_TOPIC_PREFIX = "/topic/assets/";

    private final SimpMessagingTemplate messagingTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendAssetUpdatedMessageAfterCommit(AssetUpdatedEvent event) {
        messagingTemplate.convertAndSend(
                ASSET_TOPIC_PREFIX + event.userId(),
                AssetUpdatedMessage.from(event)
        );
    }
}
