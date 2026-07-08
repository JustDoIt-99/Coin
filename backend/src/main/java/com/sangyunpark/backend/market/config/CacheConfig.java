package com.sangyunpark.backend.market.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfig {

    private static final int MAXIMUM_SIZE = 500;
    private static final int TTL = 24;

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("markets", "candles");

        cacheManager.setCaffeine(
                Caffeine.newBuilder()
                        .recordStats()
                        .maximumSize(MAXIMUM_SIZE)
                        .expireAfterWrite(Duration.ofHours(TTL))
        );

        return cacheManager;
    }
}
