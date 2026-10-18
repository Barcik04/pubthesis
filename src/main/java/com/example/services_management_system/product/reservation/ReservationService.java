package com.example.services_management_system.product.reservation;


import com.example.services_management_system.payment.invoice.InvoiceRequest;
import com.example.services_management_system.payment.invoice.InvoiceRequestRepository;
import com.example.services_management_system.payment.invoice.dto.InvoiceRequestCreateDto;
import com.example.services_management_system.payment.invoice.dto.InvoiceResultDto;
import com.example.services_management_system.product.product.Product;
import com.example.services_management_system.product.product.ProductRepository;
import com.example.services_management_system.product.productoffers.ProductOffer;
import com.example.services_management_system.product.productoffers.ProductOfferRepository;
import com.example.services_management_system.product.reservation.dto.*;
import com.example.services_management_system.product.reservation.mapper.ReservationMapper;
import com.example.services_management_system.user.User;
import com.example.services_management_system.user.UserRepository;
import com.example.services_management_system.utils.email.EmailService;
import com.example.services_management_system.utils.exception.DateInThePastException;
import com.example.services_management_system.utils.exception.DatesOverlappingException;
import com.example.services_management_system.utils.exception.InvoiceUnavailableException;
import com.example.services_management_system.utils.exception.OwnershipViolationException;
import com.example.services_management_system.utils.filtering.reservation.ReservationSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;

@Service
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final ProductOfferRepository productOfferRepository;
    private final ProductRepository productRepository;
    private final ReservationMapper reservationMapper;
    private final InvoiceRequestRepository invoiceRequestRepository;
    private final EmailService emailService;

    public ReservationService(ReservationRepository reservationRepository, UserRepository userRepository, ProductOfferRepository productOfferRepository, ProductRepository productRepository, ReservationMapper reservationMapper, InvoiceRequestRepository invoiceRequestRepository, EmailService emailService) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.productOfferRepository = productOfferRepository;
        this.productRepository = productRepository;
        this.reservationMapper = reservationMapper;
        this.invoiceRequestRepository = invoiceRequestRepository;
        this.emailService = emailService;
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public ReservationResultDto addReservation(Long userId, ReservationAndInvoiceCreateDto createDto) {
        if (createDto.reservationCreateDto().startTime().isBefore(LocalDateTime.now())) {
            throw new DateInThePastException("User tries to create reservation for the time in the past");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("couldnt find user with id: " + userId));

        ProductOffer offer = productOfferRepository.findById(createDto.reservationCreateDto().productOfferId())
                .orElseThrow(() -> new NoSuchElementException("couldnt find offer with id: " + createDto.reservationCreateDto().productOfferId()));

        LocalDateTime endTime = createDto.reservationCreateDto().startTime().plusMinutes(offer.getDurationMinutes());

        boolean existingReservations = reservationRepository.findOverlappingReservations(
                offer.getId(),
                createDto.reservationCreateDto().startTime(),
                endTime
        );

        if (existingReservations) {
            throw new DatesOverlappingException("Cannot create a reservation for that date because theres already an existing reservation for that date");
        }

        Reservation reservation = new Reservation(
                offer,
                createDto.reservationCreateDto().startTime(),
                endTime
                );

        reservation.setStatus(ReservationStatus.PENDING_PAYMENT);
        reservation.setPayment_method(createDto.reservationCreateDto().paymentMethod());

        user.addReservation(reservation);

        if (createDto.invoiceRequestCreateDto() != null) {
            if (!reservation.getProductOffer().getInvoiceAvailable()) {
                throw new InvoiceUnavailableException("invoice is not available for this offer");
            }

            InvoiceRequest invoiceRequest = new InvoiceRequest(
                    createDto.invoiceRequestCreateDto().buyerName(),
                    createDto.invoiceRequestCreateDto().buyerNip(),
                    createDto.invoiceRequestCreateDto().street(),
                    createDto.invoiceRequestCreateDto().postalCode(),
                    createDto.invoiceRequestCreateDto().city(),
                    createDto.invoiceRequestCreateDto().country(),
                    createDto.invoiceRequestCreateDto().email()
            );

            reservation.setInvoiceRequest(invoiceRequest);
            invoiceRequest.setReservation(reservation);
            reservationRepository.save(reservation);
            invoiceRequestRepository.save(invoiceRequest);
        } else {
            reservationRepository.save(reservation);


        }

        return new ReservationResultDto(
                reservation.getId(),
                reservation.getCreatedAt(),
                reservation.getStartTime(),
                reservation.getEndTime(),
                offer.getProduct().getId(),
                reservation.getStatus(),
                reservation.getPayment_method(),
                offer.getCashPaymentAvailability()
        );
    }


    @Transactional(isolation = Isolation.SERIALIZABLE)
    public ReservationResultGuestDto addReservationGuest(GuestReservationAndInvoiceDto createDto) {
        if (createDto.reservationGuestCreateDto().startTime().isBefore(LocalDateTime.now())) {
            throw new DateInThePastException("User tries to create reservation for the time in the past");
        }

        ProductOffer offer = productOfferRepository.findById(createDto.reservationGuestCreateDto().productOfferId())
                .orElseThrow(() -> new NoSuchElementException("couldnt find offer with id: " + createDto.reservationGuestCreateDto().productOfferId()));

        LocalDateTime endTime = createDto.reservationGuestCreateDto().startTime().plusMinutes(offer.getDurationMinutes());

        boolean existingReservations = reservationRepository.findOverlappingReservations(
                offer.getId(),
                createDto.reservationGuestCreateDto().startTime(),
                endTime
        );

        if (existingReservations) {
            throw new DatesOverlappingException("Cannot create a reservation for that date because theres already an existing reservation for that date");
        }

        Reservation reservation = new Reservation(
                offer,
                createDto.reservationGuestCreateDto().startTime(),
                endTime,
                createDto.reservationGuestCreateDto().guestFirstName(),
                createDto.reservationGuestCreateDto().guestLastName(),
                createDto.reservationGuestCreateDto().email()
        );

        reservation.setStatus(ReservationStatus.PENDING_PAYMENT);
        reservation.setPayment_method(createDto.reservationGuestCreateDto().paymentMethod());

        reservation.setGuestPaymentToken(
                UUID.randomUUID().toString()
        );

        if (createDto.invoiceRequestCreateDto() != null) {
            if (!reservation.getProductOffer().getInvoiceAvailable()) {
                throw new InvoiceUnavailableException("invoice is not available for this offer");
            }

            InvoiceRequest invoiceRequest = new InvoiceRequest(
                    createDto.invoiceRequestCreateDto().buyerName(),
                    createDto.invoiceRequestCreateDto().buyerNip(),
                    createDto.invoiceRequestCreateDto().street(),
                    createDto.invoiceRequestCreateDto().postalCode(),
                    createDto.invoiceRequestCreateDto().city(),
                    createDto.invoiceRequestCreateDto().country(),
                    createDto.invoiceRequestCreateDto().email()
            );

            reservation.setInvoiceRequest(invoiceRequest);
            invoiceRequest.setReservation(reservation);
            reservationRepository.save(reservation);
            invoiceRequestRepository.save(invoiceRequest);
        } else {
            reservationRepository.save(reservation);
        }

        emailService.sendGuestPaymentLink(reservation);

        return new ReservationResultGuestDto(
                reservation.getId(),
                reservation.getCreatedAt(),
                reservation.getStartTime(),
                reservation.getEndTime(),
                offer.getProduct().getId(),
                reservation.getGuestPaymentToken(),
                offer.getCashPaymentAvailability()
        );
    }




    @Transactional(readOnly = true)
    public List<ReservationCalendarResultDto> getReservationsByOffer(Long offerId) {

        ProductOffer offer = productOfferRepository.findById(offerId)
                .orElseThrow(() -> new NoSuchElementException("no offer found"));

        Set<Reservation> reservations = offer.getReservations();

        return reservations.stream().map(a ->
                new ReservationCalendarResultDto(
                        a.getStartTime(),
                        a.getEndTime()
                )
        ).toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResultDto> getMyReservations(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("no user found"));

        List<Reservation> reservations = reservationRepository.findAllByUser_Id(userId);
        return reservations.stream().map(a -> new ReservationResultDto(
                a.getId(),
                a.getCreatedAt(),
                a.getStartTime(),
                a.getEndTime(),
                a.getProductOffer().getProduct().getId(),
                a.getStatus(),
                a.getPayment_method(),
                a.getProductOffer().getCashPaymentAvailability()
        )).toList();
    }



    @Transactional
    public void deleteReservationById(Long userId, Long reservationId) {
        Reservation reservation = reservationRepository
                .findByIdAndUser_Id(reservationId, userId)
                .orElseThrow(() ->
                        new NoSuchElementException("Reservation not found")
                );

        reservationRepository.delete(reservation);
    }


    @Transactional(readOnly = true)
    public Page<ReservationResultWithOfferDto> getReservationsByProduct(ReservationFilter filter, Long productId, Long userId, Pageable pageable) {

        userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("no user found"));

        productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("no product found"));

        Specification<Reservation> spec = Specification.allOf(
                ReservationSpecification.hasProductId(productId),
                ReservationSpecification.textSearch(filter),
                ReservationSpecification.durationMinutes(filter)
                );

        Page<Reservation> reservations = reservationRepository.findAll(spec, pageable);

        return reservationMapper.reservationsToPageDto(reservations, pageable);
    }


    @Transactional
    public void revokeReservation(Long reservationId, Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("no user found"));

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new NoSuchElementException("reservation not found"));

        if (!userId.equals(reservation.getProductOffer().getProduct().getUser().getId())) {
            throw new OwnershipViolationException("User is not an owner of a product this reservation was created for");
        }

        reservationRepository.delete(reservation);
    }


    @Transactional
    public void deleteAllExpiredPaymentReservations() {
        reservationRepository.deleteAllByStatusAndPaymentExpiresAtBefore(ReservationStatus.CONFIRMED, Instant.now());
    }
}
