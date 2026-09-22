package com.example.services_management_system.product.reservation;

import com.example.services_management_system.payment.invoice.dto.InvoiceRequestCreateDto;
import com.example.services_management_system.product.product.dto.ProductFilter;
import com.example.services_management_system.product.reservation.dto.*;
import com.example.services_management_system.user.UserRepository;
import jakarta.annotation.security.PermitAll;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/reservations")
public class ReservationController {
    private final UserRepository userRepository;
    private final ReservationService reservationService;

    public ReservationController(UserRepository userRepository, ReservationService reservationService) {
        this.userRepository = userRepository;
        this.reservationService = reservationService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER')")
    public ReservationResultDto addReservation(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ReservationAndInvoiceCreateDto createDto
    ) {
        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();

        return reservationService.addReservation(
                userId,
                createDto
        );
    }


    @PostMapping("/guest")
    @PermitAll
    public ReservationResultGuestDto addReservationGuest(
            @RequestBody GuestReservationAndInvoiceDto createDto
            ) {
        return reservationService.addReservationGuest(createDto);
    }


    @GetMapping("/{offerId}")
    public List<ReservationCalendarResultDto> getReservationsByOffer(@PathVariable Long offerId) {
        return reservationService.getReservationsByOffer(offerId);
    }


    @GetMapping("/my-reservations")
    public List<ReservationResultDto> getMyReservations(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();

        return reservationService.getMyReservations(userId);
    }

    @DeleteMapping("/cancel/{reservationId}")
    @PreAuthorize("hasAuthority('USER')")
    public void cancelReservation(
            @PathVariable Long reservationId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();

        reservationService.deleteReservationById(userId, reservationId);
    }


    @GetMapping("/by-product/{productId}")
    @PreAuthorize("hasAuthority('PROVIDER')")
    public Page<ReservationResultWithOfferDto> getReservationsByProduct(
            @ParameterObject @ModelAttribute ReservationFilter filter,
            @PathVariable Long productId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                Math.min(size, 50)
        );

        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();

        return reservationService.getReservationsByProduct(filter, productId, userId, pageable);
    }



    @DeleteMapping("/revoke/{reservationId}")
    @PreAuthorize("hasAuthority('PROVIDER')")
    public void revokeReservation(
            @PathVariable Long reservationId,
            @AuthenticationPrincipal Jwt jwt
            ) {
        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();

        reservationService.revokeReservation(reservationId, userId);
    }
}
