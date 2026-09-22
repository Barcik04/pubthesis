package com.example.services_management_system.product.productoffers;

import com.example.services_management_system.product.productoffers.dto.OfferUpdateDto;
import com.example.services_management_system.product.productoffers.dto.ProductOfferCreateDto;
import com.example.services_management_system.product.productoffers.dto.ProductOfferResultDto;
import com.example.services_management_system.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/offers")
public class ProductOfferController {
    private final ProductOfferService productOfferService;
    private final UserRepository userRepository;

    public ProductOfferController(ProductOfferService productOfferService, UserRepository userRepository) {
        this.productOfferService = productOfferService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{productId}")
    public ProductOfferResultDto createOffer(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long productId,
            @RequestBody ProductOfferCreateDto createDto) {
        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();

        return productOfferService.createProductOffer(productId, userId, createDto);
    }


    @GetMapping("/{offerId}")
    public ProductOfferResultDto findOfferById(@PathVariable Long offerId) {
        return productOfferService.findOfferById(offerId);
    }


    @PutMapping("/{offerId}")
    public ProductOfferResultDto putByOfferId(
            @PathVariable Long offerId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody OfferUpdateDto updateDto
            ) {
        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();

        return productOfferService.putById(offerId, userId, updateDto);
    }


    @DeleteMapping("/{offerId}")
    public void deleteById(
            @PathVariable Long offerId,
            @AuthenticationPrincipal Jwt jwt
            ) {
        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();

        productOfferService.deleteById(userId, offerId);
    }
}
