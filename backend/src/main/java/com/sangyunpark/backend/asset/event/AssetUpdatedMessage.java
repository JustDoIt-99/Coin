package com.sangyunpark.backend.asset.event;

import java.util.List;

public record AssetUpdatedMessage(
        String type,
        Long userId,
        List<String> assetCodes,
        String reason
) {
    private static final String TYPE = "ASSET_UPDATED";

    public static AssetUpdatedMessage from(AssetUpdatedEvent event) {
        return new AssetUpdatedMessage(
                TYPE,
                event.userId(),
                event.assetCodes(),
                event.reason()
        );
    }
}
