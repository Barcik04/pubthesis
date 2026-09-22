package com.example.services_management_system.utils.exception;

import java.time.LocalDate;

public record ApiResponse(
        String info,
        String message,
        LocalDate time
) {
}