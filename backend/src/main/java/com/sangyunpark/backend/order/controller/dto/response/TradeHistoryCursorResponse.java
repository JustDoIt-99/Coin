package com.sangyunpark.backend.order.controller.dto.response;

import java.util.List;

public record TradeHistoryCursorResponse(
        List<TradeHistoryResponse> items,
        Long nextCursorId,
        boolean hasNext
) {
}
