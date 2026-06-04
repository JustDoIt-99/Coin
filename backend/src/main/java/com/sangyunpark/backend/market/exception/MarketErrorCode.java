package com.sangyunpark.backend.market.exception;

import com.sangyunpark.backend.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum MarketErrorCode implements ErrorCode {

    UPBIT_API_ERROR(HttpStatus.BAD_GATEWAY, "업비트 서버 통신에 실패했습니다."),
    UPBIT_RATE_LIMIT(HttpStatus.TOO_MANY_REQUESTS, "업비트 요청 제한에 도달했습니다."),
    MARKET_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 마켓입니다.");

    private final HttpStatus status;
    private final String message;
}
