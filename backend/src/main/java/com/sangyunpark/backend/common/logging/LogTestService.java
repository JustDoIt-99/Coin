package com.sangyunpark.backend.common.logging;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@Slf4j
public class LogTestService {

    public void writeLog(String level, String message) {
        String resolvedMessage = (message == null || message.isBlank())
                ? "Manual log test triggered"
                : message;

        LogLevel logLevel = LogLevel.valueOf(level.toUpperCase(Locale.ROOT));

        switch (logLevel) {
            case INFO -> log.info("{} level=INFO", resolvedMessage);
            case WARN -> log.warn("{} level=WARN", resolvedMessage);
            case ERROR -> log.error("{} level=ERROR", resolvedMessage);
        }
    }
}
