package com.example.services_management_system.product.reservation.dto;

import java.time.LocalDateTime;

public record ReservationWithUserDto(
        Long reservationId,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String username,
        String offerName,
        Double offerPrice,
        Integer durationMinutes
) {
}
