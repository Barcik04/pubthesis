package com.example.services_management_system.payment.invoice;

import com.example.services_management_system.payment.invoice.dto.InvoiceFilter;
import com.example.services_management_system.payment.invoice.dto.InvoiceRequestCreateDto;
import com.example.services_management_system.payment.invoice.dto.InvoiceResultDto;
import com.example.services_management_system.product.product.Product;
import com.example.services_management_system.product.reservation.Reservation;
import com.example.services_management_system.product.reservation.ReservationRepository;
import com.example.services_management_system.user.UserRepository;
import com.example.services_management_system.utils.exception.InvoiceUnavailableException;
import com.example.services_management_system.utils.exception.OwnershipViolationException;
import com.example.services_management_system.utils.filtering.invoice.InvoiceRequestSpecification;
import com.example.services_management_system.utils.filtering.product.ProductSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class InvoiceRequestService {
    private final InvoiceRequestRepository invoiceRequestRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public InvoiceRequestService(InvoiceRequestRepository invoiceRequestRepository, ReservationRepository reservationRepository, UserRepository userRepository) {
        this.invoiceRequestRepository = invoiceRequestRepository;
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public InvoiceResultDto createInvoice(Long reservationId, InvoiceRequestCreateDto createDto) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new NoSuchElementException("no reservation found"));

        if (!reservation.getProductOffer().getInvoiceAvailable()) {
            throw new InvoiceUnavailableException("invoice is not available for this offer");
        }

        InvoiceRequest invoiceRequest = new InvoiceRequest(
                createDto.buyerName(),
                createDto.buyerNip(),
                createDto.street(),
                createDto.postalCode(),
                createDto.city(),
                createDto.country(),
                createDto.email()
        );

        reservation.setInvoiceRequest(invoiceRequest);
        invoiceRequest.setReservation(reservation);
        invoiceRequestRepository.save(invoiceRequest);

        return new InvoiceResultDto(
                invoiceRequest.getId(),
                reservation.getId(),
                invoiceRequest.getBuyerName(),
                invoiceRequest.getBuyerNip(),
                invoiceRequest.getStreet(),
                invoiceRequest.getPostalCode(),
                invoiceRequest.getCity(),
                invoiceRequest.getCountry(),
                invoiceRequest.getEmail(),
                invoiceRequest.getStatus()
        );
    }


    @Transactional(readOnly = true)
    public Page<InvoiceResultDto> showInvoices(InvoiceFilter filter, Pageable pageable, Long userId) {
        Specification<InvoiceRequest> spec = Specification.allOf(
                InvoiceRequestSpecification.textSearch(filter),
                InvoiceRequestSpecification.issued(filter)
        );

        return invoiceRequestRepository
                .findAll(spec, pageable)
                .map(InvoiceResultDto::new);
    }


    @Transactional
    public InvoiceResultDto checkIssuedAt(Long invoiceId, Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("no user found"));

        InvoiceRequest foundInvoice = invoiceRequestRepository.findById(invoiceId)
                .orElseThrow(() -> new NoSuchElementException("invoice not found"));

        if (!userId.equals(foundInvoice.getReservation().getProductOffer().getProduct().getUser().getId())) {
            throw new OwnershipViolationException("user is not an owner of this invoice");
        }

        if (foundInvoice.getStatus().equals(InvoiceRequestStatus.REQUESTED)) {
            foundInvoice.setIssuedAt(Instant.now());
            foundInvoice.setStatus(InvoiceRequestStatus.ISSUED);
        } else {
            foundInvoice.setIssuedAt(null);
            foundInvoice.setStatus(InvoiceRequestStatus.REQUESTED);
        }

        return new InvoiceResultDto(foundInvoice);
    }
}
