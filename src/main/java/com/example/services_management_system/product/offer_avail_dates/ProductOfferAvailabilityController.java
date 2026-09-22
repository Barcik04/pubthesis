package com.example.services_management_system.product.offer_avail_dates;

import com.example.services_management_system.product.offer_avail_dates.dto.ProductOfferAvailabilityCreateDto;
import com.example.services_management_system.product.offer_avail_dates.dto.ProductOfferAvailabilityResultDto;
import com.example.services_management_system.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/availability")
public class ProductOfferAvailabilityController {
    private final UserRepository userRepository;
    private final ProductOfferAvailabilityService productOfferAvailabilityService;

    public ProductOfferAvailabilityController(UserRepository userRepository, ProductOfferAvailabilityService productOfferAvailabilityService) {
        this.userRepository = userRepository;
        this.productOfferAvailabilityService = productOfferAvailabilityService;
    }

    @PostMapping
    public ProductOfferAvailabilityResultDto createAvailability(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ProductOfferAvailabilityCreateDto createDto
            ) {
        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();

        return productOfferAvailabilityService.createAvailability(userId, createDto);
    }



    @DeleteMapping("/{availId}")
    public void deleteById(
            @PathVariable Long availId,
            @AuthenticationPrincipal Jwt jwt
            ) {
        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();

        productOfferAvailabilityService.deleteById(userId, availId);
    }
}
