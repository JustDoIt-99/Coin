package com.sangyunpark.backend.market.price;

import com.sangyunpark.backend.market.dto.response.OrderbookResponse;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class OrderbookCache {

    private final ConcurrentMap<String, CachedOrderbook> cache = new ConcurrentHashMap<>();

    public void put(OrderbookResponse orderbook) {
        if(orderbook == null || orderbook.code() == null || orderbook.code().isBlank()) {
            return;
        }

        cache.put(orderbook.code(), new CachedOrderbook(orderbook, Instant.now()));
    }

    public Optional<OrderbookResponse> get(String marketCode) {
        return Optional.ofNullable(cache.get(marketCode))
                .map(CachedOrderbook::orderbook);
    }

    public Optional<OrderbookResponse> getFresh(String marketCode, Duration maxAge) {
        CachedOrderbook cached = cache.get(marketCode);
        if(cached == null) {
            return Optional.empty();
        }

        if(cached.updatedAt().isBefore(Instant.now().minus(maxAge))) {
            return Optional.empty();
        }

        return Optional.of(cached.orderbook());
    }

    public boolean isFresh(String marketCode, Duration maxAge) {
        return getFresh(marketCode, maxAge).isPresent();
    }

    private record CachedOrderbook(
            OrderbookResponse orderbook,
            Instant updatedAt
    ) {}
}
