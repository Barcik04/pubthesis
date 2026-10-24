package com.example.services_management_system.payment.invoice;

import com.example.services_management_system.payment.invoice.dto.InvoiceRequestCreateDto;
import com.example.services_management_system.payment.invoice.dto.InvoiceResultDto;
import com.example.services_management_system.product.product.Product;
import com.example.services_management_system.product.productoffers.ProductOffer;
import com.example.services_management_system.product.reservation.Reservation;
import com.example.services_management_system.product.reservation.ReservationRepository;
import com.example.services_management_system.user.User;
import com.example.services_management_system.user.UserRepository;
import com.example.services_management_system.utils.exception.InvoiceUnavailableException;
import com.example.services_management_system.utils.exception.OwnershipViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceRequestServiceTest {

    @Mock
    private InvoiceRequestRepository invoiceRequestRepository;
    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private InvoiceRequestService invoiceRequestService;

    private User provider;
    private ProductOffer offer;
    private Reservation reservation;
    private InvoiceRequest invoice;

    @BeforeEach
    void setUp() {
        provider = new User("provider@example.com", "encoded", "Anna", "Nowak");
        ReflectionTestUtils.setField(provider, "id", 2L);

        Product product = new Product("Barber", "desc", 50.0, provider, null, "PL", "Warsaw", "Main", "00-001", "1", null, null);
        offer = new ProductOffer("Haircut", "short", 80.0, 60, true);
        product.addOffer(offer);

        LocalDateTime start = LocalDateTime.now().plusDays(1);
        reservation = new Reservation(offer, start, start.plusMinutes(60));
        ReflectionTestUtils.setField(reservation, "id", 5L);

        invoice = new InvoiceRequest("ACME", "1234567890", "Street 1", "00-001", "Warsaw", "Poland", "acme@example.com");
        invoice.setReservation(reservation);
    }

    @Test
    void createInvoice_offerWithoutInvoices_throws() {
        offer.setInvoiceAvailable(false);
        when(reservationRepository.findById(5L)).thenReturn(Optional.of(reservation));

        InvoiceRequestCreateDto dto = new InvoiceRequestCreateDto("ACME", "1234567890", "Street 1", "00-001", "Warsaw", "Poland", "acme@example.com");

        assertThatThrownBy(() -> invoiceRequestService.createInvoice(5L, dto))
                .isInstanceOf(InvoiceUnavailableException.class);
        verify(invoiceRequestRepository, never()).save(any());
    }

    @Test
    void checkIssuedAt_requestedInvoice_becomesIssued() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(provider));
        when(invoiceRequestRepository.findById(9L)).thenReturn(Optional.of(invoice));

        InvoiceResultDto result = invoiceRequestService.checkIssuedAt(9L, 2L);

        assertThat(result.getStatus()).isEqualTo(InvoiceRequestStatus.ISSUED);
        assertThat(invoice.getIssuedAt()).isNotNull();
    }

    @Test
    void checkIssuedAt_issuedInvoice_isToggledBackToRequested() {
        invoice.setStatus(InvoiceRequestStatus.ISSUED);
        when(userRepository.findById(2L)).thenReturn(Optional.of(provider));
        when(invoiceRequestRepository.findById(9L)).thenReturn(Optional.of(invoice));

        InvoiceResultDto result = invoiceRequestService.checkIssuedAt(9L, 2L);

        assertThat(result.getStatus()).isEqualTo(InvoiceRequestStatus.REQUESTED);
        assertThat(invoice.getIssuedAt()).isNull();
    }

    @Test
    void checkIssuedAt_byNonOwner_throwsOwnershipViolation() {
        User stranger = new User("other@example.com", "encoded", "Piotr", "Zielinski");
        ReflectionTestUtils.setField(stranger, "id", 3L);
        when(userRepository.findById(3L)).thenReturn(Optional.of(stranger));
        when(invoiceRequestRepository.findById(9L)).thenReturn(Optional.of(invoice));

        assertThatThrownBy(() -> invoiceRequestService.checkIssuedAt(9L, 3L))
                .isInstanceOf(OwnershipViolationException.class);
        assertThat(invoice.getStatus()).isEqualTo(InvoiceRequestStatus.REQUESTED);
    }
}
