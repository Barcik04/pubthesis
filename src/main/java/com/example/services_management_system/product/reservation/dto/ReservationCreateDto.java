package com.example.services_management_system.product.reservation.dto;

import com.example.services_management_system.product.productoffers.ProductOffer;
import com.example.services_management_system.product.reservation.PaymentMethod;

import java.time.LocalDateTime;

public record ReservationCreateDto(
        Long productOfferId,
        LocalDateTime startTime,
        PaymentMethod paymentMethod
) {
}
