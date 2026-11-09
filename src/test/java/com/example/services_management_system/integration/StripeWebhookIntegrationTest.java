package com.example.services_management_system.integration;

import com.example.services_management_system.product.productoffers.ProductOffer;
import com.example.services_management_system.product.reservation.PaymentMethod;
import com.example.services_management_system.product.reservation.Reservation;
import com.example.services_management_system.product.reservation.ReservationRepository;
import com.example.services_management_system.product.reservation.ReservationStatus;
import com.example.services_management_system.user.User;
import com.stripe.Stripe;
import com.stripe.net.Webhook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Simulates Stripe calling the webhook: the payload is signed with the configured webhook secret
 * the same way Stripe does, so the real signature verification in the controller runs.
 */
class StripeWebhookIntegrationTest extends AbstractIntegrationTest {

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Autowired
    private ReservationRepository reservationRepository;

    private Reservation reservation;

    @BeforeEach
    void setUp() {
        User customer = createUser("customer@example.com", "secret123", "Jan", "Kowalski");
        User provider = createUser("provider@example.com", "secret123", "Anna", "Nowak");
        ProductOffer offer = createOffer(provider, 80.0, 60, false);

        LocalDateTime start = LocalDateTime.now().plusDays(1);
        Reservation r = new Reservation(offer, start, start.plusMinutes(60));
        r.setUser(customer);
        r.setPayment_method(PaymentMethod.CARD);
        r.setStatus(ReservationStatus.PENDING_PAYMENT);
        reservation = reservationRepository.save(r);
    }

    private static String paymentSucceededEvent(String metadataJson) {
        return """
                {
                  "id": "evt_test_1",
                  "object": "event",
                  "api_version": "%s",
                  "type": "payment_intent.succeeded",
                  "data": {
                    "object": {
                      "id": "pi_test_1",
                      "object": "payment_intent",
                      "status": "succeeded",
                      "metadata": %s
                    }
                  }
                }
                """.formatted(Stripe.API_VERSION, metadataJson);
    }

    private String sign(String payload) throws Exception {
        long timestamp = Webhook.Util.getTimeNow();
        String signature = Webhook.Util.computeHmacSha256(webhookSecret, timestamp + "." + payload);
        return "t=" + timestamp + ",v1=" + signature;
    }

    private ResultActions postWebhook(String payload, String signatureHeader) throws Exception {
        return mockMvc.perform(post("/payments/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Stripe-Signature", signatureHeader)
                .content(payload));
    }

    @Test
    void paymentSucceeded_confirmsReservationAndEmailsCustomer() throws Exception {
        String payload = paymentSucceededEvent("{\"reservationId\": \"" + reservation.getId() + "\"}");

        postWebhook(payload, sign(payload))
                .andExpect(status().isOk())
                .andExpect(content().string("Webhook received"));

        Reservation updated = reservationRepository.findById(reservation.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(ReservationStatus.CONFIRMED);
        assertThat(updated.getPaymentExpiresAt()).isNull();
        verify(emailSender).send(eq("customer@example.com"), contains("Payment confirmed"), anyString());
    }

    @Test
    void invalidSignature_isRejectedAndReservationStaysUnpaid() throws Exception {
        String payload = paymentSucceededEvent("{\"reservationId\": \"" + reservation.getId() + "\"}");

        postWebhook(payload, "t=" + Webhook.Util.getTimeNow() + ",v1=deadbeef")
                .andExpect(status().isBadRequest());

        assertThat(reservationRepository.findById(reservation.getId()).orElseThrow().getStatus())
                .isEqualTo(ReservationStatus.PENDING_PAYMENT);
        verifyNoInteractions(emailSender);
    }

    @Test
    void payloadTamperedAfterSigning_isRejected() throws Exception {
        String original = paymentSucceededEvent("{\"reservationId\": \"999\"}");
        String tampered = paymentSucceededEvent("{\"reservationId\": \"" + reservation.getId() + "\"}");

        postWebhook(tampered, sign(original))
                .andExpect(status().isBadRequest());

        assertThat(reservationRepository.findById(reservation.getId()).orElseThrow().getStatus())
                .isEqualTo(ReservationStatus.PENDING_PAYMENT);
    }

    @Test
    void missingReservationMetadata_returnsBadRequest() throws Exception {
        String payload = paymentSucceededEvent("{}");

        postWebhook(payload, sign(payload))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Missing reservationId metadata"));
    }
}
