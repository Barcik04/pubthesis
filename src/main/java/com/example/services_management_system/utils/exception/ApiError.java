package com.example.services_management_system.utils.exception;

import java.time.ZonedDateTime;
import java.util.List;


public record ApiError(
        String message,
        int status,
        ZonedDateTime timestamp,
        String path,
        List<ApiFieldError> errors
) {
    public record ApiFieldError(
            String field,
            String rejectedValue,
            String message
    ) {}}