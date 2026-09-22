package com.example.services_management_system.product.productoffers.dto;

import com.example.services_management_system.product.offer_avail_dates.dto.ProductOfferAvailabilityCreateDto;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record OfferUpdateDto(
        @Size(max = 155)
        String name,
        @Size(max = 155)
        String description,
        Double price,
        Integer durationMinutes,
        Set<ProductOfferAvailabilityCreateDto> availabilities,
        Boolean cashPaymentAvailability
) {
}
