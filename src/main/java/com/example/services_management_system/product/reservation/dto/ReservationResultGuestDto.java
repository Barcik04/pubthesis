package com.example.services_management_system.product.reservation.dto;

import java.time.Instant;
import java.time.LocalDateTime;

public record ReservationResultGuestDto(
        Long id,
        Instant createdAt,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Long productId,
        String guestPaymentToken,
        Boolean cashPaymentAvailability
) {
}
