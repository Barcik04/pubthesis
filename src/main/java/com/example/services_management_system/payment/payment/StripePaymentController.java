package com.example.services_management_system.payment.payment;

import com.stripe.net.Webhook;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import org.springframework.http.ResponseEntity;

import com.example.services_management_system.payment.payment.dto.GuestPaymentIntentRequest;
import com.example.services_management_system.payment.payment.dto.PaymentIntentRequest;
import com.example.services_management_system.payment.payment.dto.PaymentIntentResponse;
import com.example.services_management_system.user.UserRepository;
import com.stripe.exception.StripeException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;



@RestController
@RequestMapping("/payments")
public class StripePaymentController {
    private final String webhookSecret;

    private final StripePaymentService stripePaymentService;
    private final UserRepository userRepository;

    public StripePaymentController(StripePaymentService stripePaymentService, UserRepository userRepository, @Value("${stripe.webhook-secret}") String webhookSecret) {
        this.stripePaymentService = stripePaymentService;
        this.userRepository = userRepository;
        this.webhookSecret = webhookSecret;
    }

    @PostMapping("/payment-intent")
    public PaymentIntentResponse createPaymentIntent(
            @RequestBody PaymentIntentRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) throws StripeException {
        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();

        return stripePaymentService.createPaymentIntent(
                request.reservationId(),
                userId
        );
    }




    @PostMapping("/guest/payment-intent")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentIntentResponse createGuestPaymentIntent(
            @RequestBody GuestPaymentIntentRequest request
    ) throws StripeException {

        return stripePaymentService.createGuestPaymentIntent(
                request.reservationId(),
                request.guestPaymentToken()
        );
    }



    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature
    ) {
        final Event event;

        try {
            event = Webhook.constructEvent(
                    payload,
                    signature,
                    webhookSecret
            );
        } catch (SignatureVerificationException exception) {
            return ResponseEntity
                    .badRequest()
                    .body("Invalid Stripe signature");
        }

        if ("payment_intent.succeeded".equals(event.getType())) {
            PaymentIntent paymentIntent = event
                    .getDataObjectDeserializer()
                    .getObject()
                    .filter(PaymentIntent.class::isInstance)
                    .map(PaymentIntent.class::cast)
                    .orElse(null);

            if (paymentIntent == null) {
                return ResponseEntity
                        .badRequest()
                        .body("PaymentIntent could not be deserialized");
            }

            String reservationIdValue =
                    paymentIntent.getMetadata().get("reservationId");

            if (reservationIdValue == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Missing reservationId metadata");
            }

            try {
                Long reservationId = Long.valueOf(reservationIdValue);

                stripePaymentService.confirmPaid(
                        reservationId
                );
            } catch (NumberFormatException exception) {
                return ResponseEntity
                        .badRequest()
                        .body("Invalid reservationId metadata");
            }
        }

        return ResponseEntity.ok("Webhook received");
    }
}
