package com.example.services_management_system.product.reservation.dto;

import com.example.services_management_system.product.productoffers.dto.ProductOfferResultDto;
import com.example.services_management_system.product.reservation.PaymentMethod;
import com.example.services_management_system.product.reservation.ReservationStatus;

import java.time.Instant;
import java.time.LocalDateTime;

public record ReservationResultWithOfferDto(
        Long id,
        Instant createdAt,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String username,
        ReservationStatus status,
        PaymentMethod paymentMethod,

        String productName,
        Integer durationMinutes,
        String offerDescription,
        String offerName,
        Double offerPrice,
        String firstName,
        String lastName
) {
}
