package com.sangyunpark.backend.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    public static final String LIMIT_ORDER_EXECUTION_EXECUTOR = "limitOrderExecutionExecutor";

    @Bean(name = LIMIT_ORDER_EXECUTION_EXECUTOR)
    public Executor limitOrderExecutionExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(1_000);
        executor.setThreadNamePrefix("limit-order-exec-");
        executor.initialize();
        return executor;
    }
}
