package com.example.services_management_system.product.reservation;

import com.example.services_management_system.payment.invoice.InvoiceRequest;
import com.example.services_management_system.payment.invoice.InvoiceRequestRepository;
import com.example.services_management_system.payment.invoice.dto.InvoiceRequestCreateDto;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProductOfferRepository productOfferRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private ReservationMapper reservationMapper;
    @Mock
    private InvoiceRequestRepository invoiceRequestRepository;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private ReservationService reservationService;

    private User user;
    private ProductOffer offer;
    private LocalDateTime start;

    @BeforeEach
    void setUp() {
        user = new User("user@example.com", "encoded", "Jan", "Kowalski");
        ReflectionTestUtils.setField(user, "id", 1L);

        User provider = new User("provider@example.com", "encoded", "Anna", "Nowak");
        ReflectionTestUtils.setField(provider, "id", 2L);

        Product product = new Product("Barber", "desc", 50.0, provider, null, "PL", "Warsaw", "Main", "00-001", "1", null, null);
        ReflectionTestUtils.setField(product, "id", 10L);

        offer = new ProductOffer("Haircut", "short", 80.0, 60, true);
        offer.setId(100L);
        product.addOffer(offer);

        start = LocalDateTime.now().plusDays(1).withNano(0);
    }

    private ReservationAndInvoiceCreateDto userDto(InvoiceRequestCreateDto invoice) {
        return new ReservationAndInvoiceCreateDto(
                new ReservationCreateDto(offer.getId(), start, PaymentMethod.CARD),
                invoice
        );
    }

    private GuestReservationAndInvoiceDto guestDto(InvoiceRequestCreateDto invoice) {
        return new GuestReservationAndInvoiceDto(
                new ReservationGuestCreateDto(offer.getId(), start, "Guest", "Person", "guest@example.com", PaymentMethod.CARD),
                invoice
        );
    }

    private InvoiceRequestCreateDto invoiceDto() {
        return new InvoiceRequestCreateDto("ACME", "1234567890", "Street 1", "00-001", "Warsaw", "Poland", "acme@example.com");
    }

    @Test
    void addReservation_createsPendingReservationWithEndTimeFromOfferDuration() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productOfferRepository.findById(100L)).thenReturn(Optional.of(offer));
        when(reservationRepository.findOverlappingReservations(100L, start, start.plusMinutes(60))).thenReturn(false);

        ReservationResultDto result = reservationService.addReservation(1L, userDto(null));

        ArgumentCaptor<Reservation> captor = ArgumentCaptor.forClass(Reservation.class);
        verify(reservationRepository).save(captor.capture());
        Reservation saved = captor.getValue();

        assertThat(saved.getUser()).isEqualTo(user);
        assertThat(saved.getProductOffer()).isEqualTo(offer);
        assertThat(saved.getStartTime()).isEqualTo(start);
        assertThat(saved.getEndTime()).isEqualTo(start.plusMinutes(60));
        assertThat(saved.getStatus()).isEqualTo(ReservationStatus.PENDING_PAYMENT);
        assertThat(saved.getPayment_method()).isEqualTo(PaymentMethod.CARD);

        assertThat(result.productId()).isEqualTo(10L);
        assertThat(result.status()).isEqualTo(ReservationStatus.PENDING_PAYMENT);
        verifyNoInteractions(invoiceRequestRepository);
    }

    @Test
    void addReservation_withInvoice_savesInvoiceLinkedToReservation() {
        offer.setInvoiceAvailable(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productOfferRepository.findById(100L)).thenReturn(Optional.of(offer));
        when(reservationRepository.findOverlappingReservations(any(), any(), any())).thenReturn(false);

        reservationService.addReservation(1L, userDto(invoiceDto()));

        ArgumentCaptor<InvoiceRequest> captor = ArgumentCaptor.forClass(InvoiceRequest.class);
        verify(invoiceRequestRepository).save(captor.capture());
        InvoiceRequest invoice = captor.getValue();
        assertThat(invoice.getBuyerNip()).isEqualTo("1234567890");
        assertThat(invoice.getReservation().getInvoiceRequest()).isSameAs(invoice);
    }

    @Test
    void addReservation_withInvoiceForOfferWithoutInvoices_throws() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productOfferRepository.findById(100L)).thenReturn(Optional.of(offer));
        when(reservationRepository.findOverlappingReservations(any(), any(), any())).thenReturn(false);

        assertThatThrownBy(() -> reservationService.addReservation(1L, userDto(invoiceDto())))
                .isInstanceOf(InvoiceUnavailableException.class);

        verify(reservationRepository, never()).save(any());
        verifyNoInteractions(invoiceRequestRepository);
    }

    @Test
    void addReservation_inThePast_throwsWithoutTouchingRepositories() {
        start = LocalDateTime.now().minusHours(1);

        assertThatThrownBy(() -> reservationService.addReservation(1L, userDto(null)))
                .isInstanceOf(DateInThePastException.class);

        verifyNoInteractions(userRepository, productOfferRepository, reservationRepository);
    }

    @Test
    void addReservation_overlappingExisting_throws() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productOfferRepository.findById(100L)).thenReturn(Optional.of(offer));
        when(reservationRepository.findOverlappingReservations(100L, start, start.plusMinutes(60))).thenReturn(true);

        assertThatThrownBy(() -> reservationService.addReservation(1L, userDto(null)))
                .isInstanceOf(DatesOverlappingException.class);

        verify(reservationRepository, never()).save(any());
    }

    @Test
    void addReservation_unknownOffer_throws() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productOfferRepository.findById(100L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reservationService.addReservation(1L, userDto(null)))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void addReservationGuest_generatesPaymentTokenAndSendsPaymentLink() {
        when(productOfferRepository.findById(100L)).thenReturn(Optional.of(offer));
        when(reservationRepository.findOverlappingReservations(any(), any(), any())).thenReturn(false);

        ReservationResultGuestDto result = reservationService.addReservationGuest(guestDto(null));

        ArgumentCaptor<Reservation> captor = ArgumentCaptor.forClass(Reservation.class);
        verify(reservationRepository).save(captor.capture());
        Reservation saved = captor.getValue();

        assertThat(saved.getUser()).isNull();
        assertThat(saved.getEmail()).isEqualTo("guest@example.com");
        assertThat(saved.getGuestPaymentToken()).isNotBlank().hasSize(36);
        assertThat(result.guestPaymentToken()).isEqualTo(saved.getGuestPaymentToken());
        verify(emailService).sendGuestPaymentLink(saved);
    }

    @Test
    void addReservationGuest_overlapping_throwsAndSendsNoEmail() {
        when(productOfferRepository.findById(100L)).thenReturn(Optional.of(offer));
        when(reservationRepository.findOverlappingReservations(any(), any(), any())).thenReturn(true);

        assertThatThrownBy(() -> reservationService.addReservationGuest(guestDto(null)))
                .isInstanceOf(DatesOverlappingException.class);

        verifyNoInteractions(emailService);
    }

    @Test
    void revokeReservation_byProductOwner_deletesReservation() {
        Reservation reservation = new Reservation(offer, start, start.plusMinutes(60));
        when(userRepository.findById(2L)).thenReturn(Optional.of(offer.getProduct().getUser()));
        when(reservationRepository.findById(5L)).thenReturn(Optional.of(reservation));

        reservationService.revokeReservation(5L, 2L);

        verify(reservationRepository).delete(reservation);
    }

    @Test
    void revokeReservation_byNonOwner_throwsOwnershipViolation() {
        Reservation reservation = new Reservation(offer, start, start.plusMinutes(60));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(reservationRepository.findById(5L)).thenReturn(Optional.of(reservation));

        assertThatThrownBy(() -> reservationService.revokeReservation(5L, 1L))
                .isInstanceOf(OwnershipViolationException.class);

        verify(reservationRepository, never()).delete(any(Reservation.class));
    }

    @Test
    void deleteReservationById_reservationOfAnotherUser_throws() {
        when(reservationRepository.findByIdAndUser_Id(5L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reservationService.deleteReservationById(1L, 5L))
                .isInstanceOf(NoSuchElementException.class);

        verify(reservationRepository, never()).delete(any(Reservation.class));
    }

    @Test
    void deleteAllExpiredPaymentReservations_keepsConfirmedOnes() {
        reservationService.deleteAllExpiredPaymentReservations();

        verify(reservationRepository).deleteAllByStatusAndPaymentExpiresAtBefore(eq(ReservationStatus.CONFIRMED), any(Instant.class));
    }
}
