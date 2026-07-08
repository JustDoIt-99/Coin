package com.sangyunpark.backend.asset.event;

import java.util.List;

public record AssetUpdatedEvent(
        Long userId,
        List<String> assetCodes,
        String reason
) {
    public AssetUpdatedEvent {
        assetCodes = List.copyOf(assetCodes);
    }
}
