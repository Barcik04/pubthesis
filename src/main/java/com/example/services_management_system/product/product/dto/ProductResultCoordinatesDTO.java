package com.example.services_management_system.product.product.dto;

import com.example.services_management_system.product.productoffers.dto.ProductOfferResultDto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;

public record ProductResultCoordinatesDTO(
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
        BigDecimal latitude,
        BigDecimal longitude
) {
}
