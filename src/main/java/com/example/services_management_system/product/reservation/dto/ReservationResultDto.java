package com.example.services_management_system.product.reservation.dto;

import com.example.services_management_system.product.reservation.PaymentMethod;
import com.example.services_management_system.product.reservation.ReservationStatus;

import java.time.Instant;
import java.time.LocalDateTime;

public record ReservationResultDto(
        Long id,
        Instant createdAt,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Long productId,
        ReservationStatus status,
        PaymentMethod paymentMethod,
        Boolean cashPaymentAvailability
) {
}
