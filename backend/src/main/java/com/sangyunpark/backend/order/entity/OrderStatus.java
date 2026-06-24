package com.sangyunpark.backend.order.entity;

public enum OrderStatus {
    PENDING,
    EXECUTING,
    EXECUTION_RETRY_PENDING,
    FILLED,
    CANCELLED
}
