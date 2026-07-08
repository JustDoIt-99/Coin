package com.sangyunpark.backend.common.exception;

public record ErrorResponse(
        int status,
        String message
) {

    public static ErrorResponse from(ErrorCode errorCode) {
        return new ErrorResponse(
                errorCode.getStatus().value(),
                errorCode.getMessage()
        );
    }
}
