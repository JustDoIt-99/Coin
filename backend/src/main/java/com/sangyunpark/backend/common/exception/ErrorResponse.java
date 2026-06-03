package com.sangyunpark.backend.common.exception;

import com.sangyunpark.backend.auth.exception.ErrorCode;

public record ErrorResponse(
        int status,
        String code,
        String message
) {

    public static ErrorResponse from(ErrorCode errorCode) {
        return new ErrorResponse(
                errorCode.getStatus().value(),
                errorCode.name(),
                errorCode.getMessage()
        );
    }
}
