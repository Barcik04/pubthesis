package com.example.services_management_system.payment.payment;

import com.example.services_management_system.payment.payment.dto.PaymentIntentResponse;
import com.example.services_management_system.product.productoffers.ProductOffer;
import com.example.services_management_system.product.reservation.Reservation;
import com.example.services_management_system.product.reservation.ReservationRepository;
import com.example.services_management_system.product.reservation.ReservationStatus;
import com.example.services_management_system.utils.email.EmailService;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripePaymentServiceTest {

    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private StripePaymentService stripePaymentService;

    private Reservation reservation;

    @BeforeEach
    void setUp() {
        ProductOffer offer = new ProductOffer("Haircut", "short", 79.99, 60, false);
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        reservation = new Reservation(offer, start, start.plusMinutes(60));
        ReflectionTestUtils.setField(reservation, "id", 7L);
        reservation.setStatus(ReservationStatus.PENDING_PAYMENT);
        reservation.setPaymentExpiresAt(Instant.now().plus(Duration.ofMinutes(10)));
    }

    private static PaymentIntent paymentIntent(String id, String secret, String status) {
        PaymentIntent intent = new PaymentIntent();
        intent.setId(id);
        intent.setClientSecret(secret);
        intent.setStatus(status);
        return intent;
    }

    @Test
    void createPaymentIntent_createsIntentWithAmountInGroszAndReservationMetadata() throws Exception {
        when(reservationRepository.findByIdAndUser_Id(7L, 1L)).thenReturn(Optional.of(reservation));

        try (MockedStatic<PaymentIntent> stripe = mockStatic(PaymentIntent.class)) {
            stripe.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)))
                    .thenReturn(paymentIntent("pi_123", "secret_123", "requires_payment_method"));

            PaymentIntentResponse response = stripePaymentService.createPaymentIntent(7L, 1L);

            ArgumentCaptor<PaymentIntentCreateParams> captor = ArgumentCaptor.forClass(PaymentIntentCreateParams.class);
            stripe.verify(() -> PaymentIntent.create(captor.capture()));
            PaymentIntentCreateParams params = captor.getValue();

            assertThat(params.getAmount()).isEqualTo(7999L);
            assertThat(params.getCurrency()).isEqualTo("pln");
            assertThat(params.getMetadata()).containsEntry("reservationId", "7");
            assertThat(response.paymentIntentId()).isEqualTo("pi_123");
            assertThat(response.clientSecret()).isEqualTo("secret_123");
            assertThat(reservation.getStripePaymentIntentId()).isEqualTo("pi_123");
        }
    }

    @Test
    void createPaymentIntent_reusesExistingActiveIntent() throws Exception {
        reservation.setStripePaymentIntentId("pi_existing");
        when(reservationRepository.findByIdAndUser_Id(7L, 1L)).thenReturn(Optional.of(reservation));

        try (MockedStatic<PaymentIntent> stripe = mockStatic(PaymentIntent.class)) {
            stripe.when(() -> PaymentIntent.retrieve("pi_existing"))
                    .thenReturn(paymentIntent("pi_existing", "secret_existing", "requires_payment_method"));

            PaymentIntentResponse response = stripePaymentService.createPaymentIntent(7L, 1L);

            assertThat(response.paymentIntentId()).isEqualTo("pi_existing");
            stripe.verify(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)), never());
        }
    }

    @Test
    void createPaymentIntent_replacesCanceledIntent() throws Exception {
        reservation.setStripePaymentIntentId("pi_old");
        when(reservationRepository.findByIdAndUser_Id(7L, 1L)).thenReturn(Optional.of(reservation));

        try (MockedStatic<PaymentIntent> stripe = mockStatic(PaymentIntent.class)) {
            stripe.when(() -> PaymentIntent.retrieve("pi_old"))
                    .thenReturn(paymentIntent("pi_old", "secret_old", "canceled"));
            stripe.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)))
                    .thenReturn(paymentIntent("pi_new", "secret_new", "requires_payment_method"));

            PaymentIntentResponse response = stripePaymentService.createPaymentIntent(7L, 1L);

            assertThat(response.paymentIntentId()).isEqualTo("pi_new");
            assertThat(reservation.getStripePaymentIntentId()).isEqualTo("pi_new");
        }
    }

    @Test
    void createPaymentIntent_alreadyPaid_throws() {
        reservation.setStatus(ReservationStatus.CONFIRMED);
        when(reservationRepository.findByIdAndUser_Id(7L, 1L)).thenReturn(Optional.of(reservation));

        assertThatThrownBy(() -> stripePaymentService.createPaymentIntent(7L, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already paid");
    }

    @Test
    void createPaymentIntent_reservationOfAnotherUser_throws() {
        when(reservationRepository.findByIdAndUser_Id(7L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> stripePaymentService.createPaymentIntent(7L, 1L))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void createGuestPaymentIntent_invalidToken_throws() {
        when(reservationRepository.findByIdAndGuestPaymentToken(7L, "bad-token")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> stripePaymentService.createGuestPaymentIntent(7L, "bad-token"))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void createGuestPaymentIntent_expiredPaymentWindow_throws() {
        reservation.setPaymentExpiresAt(Instant.now().minusSeconds(1));
        when(reservationRepository.findByIdAndGuestPaymentToken(7L, "token")).thenReturn(Optional.of(reservation));

        try (MockedStatic<PaymentIntent> stripe = mockStatic(PaymentIntent.class)) {
            assertThatThrownBy(() -> stripePaymentService.createGuestPaymentIntent(7L, "token"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("expired");

            stripe.verifyNoInteractions();
        }
    }

    @Test
    void createGuestPaymentIntent_validToken_createsIntent() throws Exception {
        when(reservationRepository.findByIdAndGuestPaymentToken(7L, "token")).thenReturn(Optional.of(reservation));

        try (MockedStatic<PaymentIntent> stripe = mockStatic(PaymentIntent.class)) {
            stripe.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)))
                    .thenReturn(paymentIntent("pi_guest", "secret_guest", "requires_payment_method"));

            PaymentIntentResponse response = stripePaymentService.createGuestPaymentIntent(7L, "token");

            assertThat(response.paymentIntentId()).isEqualTo("pi_guest");
            assertThat(reservation.getStripePaymentIntentId()).isEqualTo("pi_guest");
        }
    }

    @Test
    void confirmPaid_marksReservationConfirmedAndSendsConfirmation() {
        when(reservationRepository.findById(7L)).thenReturn(Optional.of(reservation));

        stripePaymentService.confirmPaid(7L);

        assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.CONFIRMED);
        assertThat(reservation.getPaymentExpiresAt()).isNull();
        verify(emailService).sendPurchaseConfirmation(7L);
    }

    @Test
    void confirmPaid_cancelledReservation_isLeftUntouched() {
        reservation.setStatus(ReservationStatus.CANCELLED);
        when(reservationRepository.findById(7L)).thenReturn(Optional.of(reservation));

        stripePaymentService.confirmPaid(7L);

        assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
        verifyNoInteractions(emailService);
    }
}
