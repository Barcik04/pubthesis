package com.example.services_management_system.product.productoffers.dto;

import com.example.services_management_system.product.offer_avail_dates.dto.ProductOfferAvailabilityResultDto;

import java.util.Set;

public record ProductOfferResultDto(
        Long id,
        String name,
        String description,
        Double price,
        Integer duration,
        Set<ProductOfferAvailabilityResultDto> availabilities,
        Boolean cashPaymentAvailability
) {
}
