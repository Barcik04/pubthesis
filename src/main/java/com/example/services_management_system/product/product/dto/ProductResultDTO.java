package com.example.services_management_system.product.product.dto;

import com.example.services_management_system.product.offer_avail_dates.dto.ProductOfferAvailabilityResultDto;
import com.example.services_management_system.product.product.Product;
import com.example.services_management_system.product.productoffers.ProductOffer;
import com.example.services_management_system.product.productoffers.dto.ProductOfferResultDto;

import java.time.Instant;
import java.util.Set;

public record ProductResultDTO(
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

        String houseNumber
) {
}
