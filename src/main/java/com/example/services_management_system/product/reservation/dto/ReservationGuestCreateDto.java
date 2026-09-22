package com.example.services_management_system.product.reservation.dto;

import com.example.services_management_system.product.reservation.PaymentMethod;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record ReservationGuestCreateDto(
        Long productOfferId,
        LocalDateTime startTime,

        @NotBlank
        @Size(max = 100)
        String guestFirstName,

        @NotBlank
        @Size(max = 100)
        String guestLastName,

        @NotBlank
        @Email
        @Size(max = 254)
        String email,

        @NotBlank
        PaymentMethod paymentMethod
) {
}
