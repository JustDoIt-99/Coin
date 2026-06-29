package com.sangyunpark.backend.asset.exception;

import com.sangyunpark.backend.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum AssetErrorCode implements ErrorCode {

    ASSET_TRANSFER_REQUEST_NOT_FOUND(HttpStatus.NOT_FOUND, "입출금 요청을 찾을 수 없습니다."),
    ASSET_TRANSFER_REQUEST_NOT_PROCESSABLE(HttpStatus.BAD_REQUEST, "처리할 수 없는 입출금 요청입니다.");

    private final HttpStatus status;
    private final String message;
}
