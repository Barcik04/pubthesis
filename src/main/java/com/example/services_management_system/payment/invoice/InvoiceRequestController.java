package com.example.services_management_system.payment.invoice;

import com.example.services_management_system.payment.invoice.dto.InvoiceFilter;
import com.example.services_management_system.payment.invoice.dto.InvoiceRequestCreateDto;
import com.example.services_management_system.payment.invoice.dto.InvoiceResultDto;
import com.example.services_management_system.product.product.dto.ProductFilter;
import com.example.services_management_system.product.reservation.ReservationRepository;

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

@RestController
@RequestMapping("/invoice")
public class InvoiceRequestController {
    private final InvoiceRequestService invoiceRequestService;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public InvoiceRequestController(InvoiceRequestService invoiceRequestService, ReservationRepository reservationRepository, UserRepository userRepository) {
        this.invoiceRequestService = invoiceRequestService;
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

//    @PostMapping("/{reservationId}")
//    @PermitAll
//    public InvoiceResultDto createInvoice(
//            @PathVariable Long reservationId,
//            @RequestBody InvoiceRequestCreateDto createDto
//    ) {
//        return invoiceRequestService.createInvoice(reservationId, createDto);
//    }


    @GetMapping
    @PreAuthorize("hasAuthority('PROVIDER')")
    public Page<InvoiceResultDto> showInvoices(
            @ParameterObject @ModelAttribute InvoiceFilter filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Pageable pageable = PageRequest.of(
                page,
                Math.min(size, 50)
        );

        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();

        return invoiceRequestService.showInvoices(filter, pageable, userId);
    }


    @PutMapping("/{invoiceId}")
    public InvoiceResultDto checkIssuedAt(@PathVariable Long invoiceId, @AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();

        return invoiceRequestService.checkIssuedAt(invoiceId, userId);
    }
}
