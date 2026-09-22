package com.example.services_management_system.product.offer_avail_dates;

import com.example.services_management_system.product.offer_avail_dates.dto.ProductOfferAvailabilityCreateDto;
import com.example.services_management_system.product.offer_avail_dates.dto.ProductOfferAvailabilityResultDto;
import com.example.services_management_system.product.productoffers.ProductOffer;
import com.example.services_management_system.product.productoffers.ProductOfferRepository;
import com.example.services_management_system.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
public class ProductOfferAvailabilityService {
    private final ProductOfferAvailabilityRepository productOfferAvailabilityRepository;
    private final UserRepository userRepository;
    private final ProductOfferRepository productOfferRepository;

    public ProductOfferAvailabilityService(ProductOfferAvailabilityRepository productOfferAvailabilityRepository, UserRepository userRepository, ProductOfferRepository productOfferRepository) {
        this.productOfferAvailabilityRepository = productOfferAvailabilityRepository;
        this.userRepository = userRepository;
        this.productOfferRepository = productOfferRepository;
    }

    @Transactional
    public ProductOfferAvailabilityResultDto createAvailability(Long userId, ProductOfferAvailabilityCreateDto createDto) {
        userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("user not found"));

        ProductOffer offer = productOfferRepository.findById(createDto.offerId()).orElseThrow(() -> new NoSuchElementException("offer not found"));

        ProductOfferAvailability availability = new ProductOfferAvailability(
                createDto.dayOfWeek(),
                createDto.startTime(),
                createDto.endTime()
        );
        offer.addAvailability(availability);

        productOfferAvailabilityRepository.save(availability);

        return new ProductOfferAvailabilityResultDto(
                availability.getId(),
                availability.getDayOfWeek(),
                availability.getStartTime(),
                availability.getEndTime()
        );
    }


    @Transactional
    public void deleteById(Long userId, Long availId) {
        userRepository.findById(userId)
                        .orElseThrow(() -> new NoSuchElementException("no user found"));

        productOfferAvailabilityRepository.deleteById(availId);
    }
}
