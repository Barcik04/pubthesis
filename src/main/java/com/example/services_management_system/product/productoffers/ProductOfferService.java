package com.example.services_management_system.product.productoffers;

import com.example.services_management_system.product.offer_avail_dates.ProductOfferAvailability;
import com.example.services_management_system.product.offer_avail_dates.ProductOfferAvailabilityRepository;
import com.example.services_management_system.product.offer_avail_dates.dto.ProductOfferAvailabilityCreateDto;
import com.example.services_management_system.product.offer_avail_dates.dto.ProductOfferAvailabilityResultDto;
import com.example.services_management_system.product.product.Product;
import com.example.services_management_system.product.product.ProductRepository;
import com.example.services_management_system.product.productoffers.dto.OfferUpdateDto;
import com.example.services_management_system.product.productoffers.dto.ProductOfferCreateDto;
import com.example.services_management_system.product.productoffers.dto.ProductOfferResultDto;
import com.example.services_management_system.product.productoffers.mapper.ProductOfferMapper;
import com.example.services_management_system.user.User;
import com.example.services_management_system.user.UserRepository;
import com.example.services_management_system.utils.exception.OwnershipViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;

@Service
public class ProductOfferService {
    private final ProductOfferRepository productOfferRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductOfferMapper productOfferMapper;
    private final ProductOfferAvailabilityRepository availabilityRepository;

    public ProductOfferService(ProductOfferRepository productOfferRepository, ProductRepository productRepository, UserRepository userRepository, ProductOfferMapper productOfferMapper, ProductOfferAvailabilityRepository availabilityRepository) {
        this.productOfferRepository = productOfferRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.productOfferMapper = productOfferMapper;
        this.availabilityRepository = availabilityRepository;
    }

    public ProductOfferResultDto createProductOffer(Long productId, Long userId, ProductOfferCreateDto createDto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("product with id: " + productId + " not found."));

        userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("user not found"));

        productRepository.findByIdAndUserId(productId, userId)
                .orElseThrow(() -> new OwnershipViolationException("you are not an owner of this product"));

        ProductOffer productOffer = new ProductOffer(
                createDto.name(),
                createDto.description(),
                createDto.price(),
                createDto.durationMinutes(),
                createDto.cashPaymentAvailability()
        );

        product.addOffer(productOffer);

        ProductOffer savedOffer = productOfferRepository.save(productOffer);

        return productOfferMapper.productOfferToDto(savedOffer);
    }



    @Transactional(readOnly = true)
    public ProductOfferResultDto findOfferById(Long offerId) {
        ProductOffer offer = productOfferRepository.findById(offerId)
                .orElseThrow(() -> new NoSuchElementException("no offer found"));

        return productOfferMapper.productOfferToDto(offer);
    }


    @Transactional
    public ProductOfferResultDto putById(Long offerId, Long userId, OfferUpdateDto offerDto) {
        userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("user not found"));

        ProductOffer offer = productOfferRepository.findById(offerId)
                .orElseThrow(() -> new NoSuchElementException("no offer found"));


        if (!offerDto.name().isBlank()) {offer.setName(offerDto.name());}
        if (!offerDto.description().isBlank()) {offer.setDescription(offerDto.description());}
        if (offerDto.price() != null) {offer.setPrice(offerDto.price());}
        if (offerDto.durationMinutes() != null) {offer.setDurationMinutes(offerDto.durationMinutes());}
        if (offerDto.cashPaymentAvailability() != null) {offer.setCashPaymentAvailability(offerDto.cashPaymentAvailability());}

        availabilityRepository.deleteAvailabilitiesAllByOfferId(offerId);

        Set<ProductOfferAvailabilityResultDto> availabilityResultDtos = new HashSet<>();

        for (ProductOfferAvailabilityCreateDto availability : offerDto.availabilities()) {
            offer.addAvailability(new ProductOfferAvailability(
                    availability.dayOfWeek(),
                    availability.startTime(),
                    availability.endTime()
            ));

            availabilityResultDtos.add(new ProductOfferAvailabilityResultDto(
                    availability.offerId(),
                    availability.dayOfWeek(),
                    availability.startTime(),
                    availability.endTime()
            ));
        }


        return new ProductOfferResultDto(
                offer.getId(),
                offer.getName(),
                offer.getDescription(),
                offer.getPrice(),
                offer.getDurationMinutes(),
                availabilityResultDtos,
                offer.getCashPaymentAvailability()
        );
    }



    @Transactional
    public void deleteById(Long userId, Long offerId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("no user found"));

        boolean isOwner = productOfferRepository.existsByIdAndProduct_User_Id(offerId, userId);
        if (!isOwner) {
            throw new OwnershipViolationException("this offers does not belong to the user");
        }


        productOfferRepository.deleteById(offerId);
    }
}
