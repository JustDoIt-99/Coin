package com.sangyunpark.backend.order.exception;

import com.sangyunpark.backend.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum OrderErrorCode implements ErrorCode {

    INVALID_MARKET_CODE(HttpStatus.BAD_REQUEST, "지원하지 않는 마켓 코드입니다."),
    INSUFFICIENT_BALANCE(HttpStatus.BAD_REQUEST, "잔액이 부족합니다."),
    ORDER_AMOUNT_TOO_SMALL(HttpStatus.BAD_REQUEST, "주문 금액이 너무 작습니다."),
    INVALID_MARKET_PRICE(HttpStatus.BAD_REQUEST, "유효하지 않은 시장 가격입니다."),
    INVALID_LIMIT_PRICE(HttpStatus.BAD_REQUEST, "지정가는 0보다 커야 합니다."),
    INVALID_ASSET_AMOUNT(HttpStatus.BAD_REQUEST, "자산 금액은 0보다 커야 합니다."),
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "주문을 찾을 수 없습니다."),
    ORDER_NOT_CANCELABLE(HttpStatus.BAD_REQUEST, "취소할 수 없는 주문입니다.");

    private final HttpStatus status;
    private final String message;
}
