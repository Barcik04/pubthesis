package com.example.services_management_system.product.productoffers.mapper;

import com.example.services_management_system.product.productoffers.ProductOffer;
import com.example.services_management_system.product.productoffers.dto.ProductOfferResultDto;

import java.util.Set;

public interface ProductOfferMapper {
    Set<ProductOfferResultDto> productOffersToDto(Set<ProductOffer> offers);
    ProductOfferResultDto productOfferToDto(ProductOffer offer);

}
