package com.sangyunpark.backend.market.scheduler;

import com.sangyunpark.backend.market.restClient.UpbitTickerWebSocketClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MarketSubscriptionScheduler {

    private final UpbitTickerWebSocketClient upbitTickerWebSocketClient;

    @Scheduled(cron = "0 0 4 * * *", zone = "Asia/Seoul")
    public void refreshMarketSubscription() {
        log.info("Upbit 마켓 구독 목록 일일 갱신 시작");
        upbitTickerWebSocketClient.refreshMarketSubscription();
    }
}
