package com.example.services_management_system.product.product.dto;

import com.example.services_management_system.product.productoffers.dto.ProductOfferResultDto;

import java.time.Instant;
import java.util.Set;

public record ProductResultDtoWithMapLink(
        Long id,
        String name,
        String description,
        Set<String> types,
        Double price,
        Instant creationDate,
        boolean isActive,
        String imageUrl,
        Set<ProductOfferResultDto> offers,
        String country,

        String city,

        String street,

        String postalCode,

        String houseNumber,
        String googleMapsLink
) {
}
