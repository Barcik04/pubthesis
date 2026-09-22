package com.example.services_management_system.product.productoffers.mapper;

import com.example.services_management_system.product.offer_avail_dates.ProductOfferAvailability;
import com.example.services_management_system.product.offer_avail_dates.dto.ProductOfferAvailabilityResultDto;
import com.example.services_management_system.product.productoffers.ProductOffer;
import com.example.services_management_system.product.productoffers.dto.ProductOfferResultDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class ProductOfferImpl implements ProductOfferMapper{
    @Override
    public Set<ProductOfferResultDto> productOffersToDto(Set<ProductOffer> offers) {
        Set<ProductOfferResultDto> result = new HashSet<>();

        for (ProductOffer offer : offers) {
            Set<ProductOfferAvailabilityResultDto> availabilities = new HashSet<>();

            for (ProductOfferAvailability availability : offer.getAvailabilities()) {
                availabilities.add(new ProductOfferAvailabilityResultDto(
                        availability.getId(),
                        availability.getDayOfWeek(),
                        availability.getStartTime(),
                        availability.getEndTime()
                ));
            }

            result.add(new ProductOfferResultDto(
                    offer.getId(),
                    offer.getName(),
                    offer.getDescription(),
                    offer.getPrice(),
                    offer.getDurationMinutes(),
                    availabilities,
                    offer.getCashPaymentAvailability()
            ));
        }

        return result;
    }

    @Override
    public ProductOfferResultDto productOfferToDto(ProductOffer offer) {
        Set<ProductOfferAvailabilityResultDto> availabilities = new HashSet<>();

        for (ProductOfferAvailability availability : offer.getAvailabilities()) {
            availabilities.add(new ProductOfferAvailabilityResultDto(
                    availability.getId(),
                    availability.getDayOfWeek(),
                    availability.getStartTime(),
                    availability.getEndTime()
            ));
        }

        return new ProductOfferResultDto(
                offer.getId(),
                offer.getName(),
                offer.getDescription(),
                offer.getPrice(),
                offer.getDurationMinutes(),
                availabilities,
                offer.getCashPaymentAvailability()
        );
    }
}
