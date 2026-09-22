package com.example.services_management_system.product.reservation.dto;

import java.time.LocalDateTime;

public record ReservationCalendarResultDto(
        LocalDateTime startTime,
        LocalDateTime endTime
) {
}
