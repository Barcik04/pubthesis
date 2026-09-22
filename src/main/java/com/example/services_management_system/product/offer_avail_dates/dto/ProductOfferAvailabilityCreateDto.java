package com.example.services_management_system.product.offer_avail_dates.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record ProductOfferAvailabilityCreateDto(
        @NotNull
        DayOfWeek dayOfWeek,
        @NotBlank
        LocalTime startTime,
        @NotBlank
        LocalTime endTime,

        Long offerId
) {
}
