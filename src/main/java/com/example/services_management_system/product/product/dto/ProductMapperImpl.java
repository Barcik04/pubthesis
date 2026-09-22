package com.example.services_management_system.product.product.dto;

import com.example.services_management_system.product.offer_avail_dates.ProductOfferAvailability;
import com.example.services_management_system.product.offer_avail_dates.dto.ProductOfferAvailabilityResultDto;
import com.example.services_management_system.product.product.Product;
import com.example.services_management_system.product.productoffers.ProductOffer;
import com.example.services_management_system.product.productoffers.dto.ProductOfferResultDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public ProductResultDTO productToProductResultDTO(Product product) {
        if (product == null) {
            return null;
        }

        Set<String> types = product.getProductTypes()
                .stream()
                .map(type -> type.getProductType().getType())
                .collect(Collectors.toSet());

        Set<ProductOfferResultDto> offers = product.getOffers()
                .stream()
                .map(this::productOfferToProductOfferResultDto)
                .collect(Collectors.toSet());

        return new ProductResultDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                types,
                product.getPrice(),
                product.getCreatedAt(),
                product.isActive(),
                product.getImageUrl(),
                offers,
                product.getCountry(),
                product.getCity(),
                product.getStreet(),
                product.getPostalCode(),
                product.getHouseNumber()
        );
    }



    private ProductOfferResultDto productOfferToProductOfferResultDto(ProductOffer offer) {
        if (offer == null) {
            return null;
        }

        Set<ProductOfferAvailabilityResultDto> availabilities = offer.getAvailabilities()
                .stream()
                .map(this::availabilityToProductOfferAvailabilityResultDto)
                .collect(Collectors.toSet());

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

    private ProductOfferAvailabilityResultDto availabilityToProductOfferAvailabilityResultDto(
            ProductOfferAvailability availability
    ) {
        if (availability == null) {
            return null;
        }

        return new ProductOfferAvailabilityResultDto(
                availability.getId(),
                availability.getDayOfWeek(),
                availability.getStartTime(),
                availability.getEndTime()
        );
    }

    @Override
    public List<ProductResultDTO> productListToProductResponseDtoList(List<Product> products) {
        List<ProductResultDTO> productsDto = new ArrayList<>();

        for (Product product : products) {
            if (product == null) {
                continue;
            }

            productsDto.add(productToProductResultDTO(product));
        }

        return productsDto;
    }
}