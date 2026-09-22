package com.example.services_management_system.product.productoffers.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProductOfferCreateDto(
        @NotBlank(message = "name of the product cannot be blank")
        @Size(max = 100, message = "name cannot be longer that 100 characters")
        String name,

        @Size(max = 100, message = "description cannot be longer that 100 characters")
        String description,

        @PositiveOrZero(message = "price cannot be negative")
        Double price,

        @Positive(message = "Duration must be positive")
        Integer durationMinutes,

        @NotBlank
        Boolean cashPaymentAvailability
) {
}
