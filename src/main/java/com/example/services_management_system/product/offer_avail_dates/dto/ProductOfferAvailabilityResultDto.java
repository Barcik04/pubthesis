package com.example.services_management_system.product.offer_avail_dates.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record ProductOfferAvailabilityResultDto(
        Long id,
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        LocalTime endTime
) {
}
