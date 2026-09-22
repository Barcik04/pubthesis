package com.example.services_management_system.payment.payment;


import com.example.services_management_system.payment.payment.dto.PaymentIntentResponse;
import com.example.services_management_system.product.reservation.Reservation;
import com.example.services_management_system.product.reservation.ReservationRepository;
import com.example.services_management_system.product.reservation.ReservationStatus;
import com.example.services_management_system.utils.email.EmailService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;

@Service
public class StripePaymentService {
    private static final Logger logger =
            LoggerFactory.getLogger(StripePaymentService.class);


    private final ReservationRepository reservationRepository;
    private final EmailService emailService;

    public StripePaymentService(ReservationRepository reservationRepository, EmailService emailService) {
        this.reservationRepository = reservationRepository;
        this.emailService = emailService;
    }

    @Transactional
    public PaymentIntentResponse createPaymentIntent(
            Long reservationId,
            Long userId
    ) throws StripeException {

        Reservation reservation = reservationRepository
                .findByIdAndUser_Id(reservationId, userId)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Reservation not found or does not belong to user"
                        )
                );

        if (reservation.getStatus() == ReservationStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Reservation is already paid"
            );
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Reservation is cancelled"
            );
        }

        double price = reservation
                .getProductOffer()
                .getPrice();

        if (reservation.getStripePaymentIntentId() != null) {
            PaymentIntent existingPaymentIntent =
                    PaymentIntent.retrieve(
                            reservation.getStripePaymentIntentId()
                    );

            if (!"canceled".equals(existingPaymentIntent.getStatus())) {
                return new PaymentIntentResponse(
                        existingPaymentIntent.getId(),
                        existingPaymentIntent.getClientSecret()
                );
            }

            reservation.setStripePaymentIntentId(null);
        }

        long amountInGrosz = BigDecimal.valueOf(price)
                .movePointRight(2)
                .longValueExact();

        PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                        .setAmount(amountInGrosz)
                        .setCurrency("pln")
                        .addPaymentMethodType("card")
                        .putMetadata(
                                "reservationId",
                                reservationId.toString()
                        )
                        .build();

        PaymentIntent paymentIntent =
                PaymentIntent.create(params);

        reservation.setStripePaymentIntentId(paymentIntent.getId());

        return new PaymentIntentResponse(
                paymentIntent.getId(),
                paymentIntent.getClientSecret()
        );
    }






    @Transactional
    public PaymentIntentResponse createGuestPaymentIntent(
            Long reservationId,
            String guestPaymentToken
    ) throws StripeException {

        Reservation reservation = reservationRepository
                .findByIdAndGuestPaymentToken(
                        reservationId,
                        guestPaymentToken
                )
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Guest reservation not found or invalid payment token"
                        )
                );

        if (
                reservation.getPaymentExpiresAt() == null ||
                        !reservation.getPaymentExpiresAt().isAfter(Instant.now())
        ) {
            throw new IllegalStateException(
                    "Payment time has expired"
            );
        }

        if (reservation.getStatus() == ReservationStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Reservation is already paid"
            );
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Reservation is cancelled"
            );
        }

        if (reservation.getStripePaymentIntentId() != null) {
            PaymentIntent existingPaymentIntent =
                    PaymentIntent.retrieve(
                            reservation.getStripePaymentIntentId()
                    );

            if (!"canceled".equals(existingPaymentIntent.getStatus())) {
                return new PaymentIntentResponse(
                        existingPaymentIntent.getId(),
                        existingPaymentIntent.getClientSecret()
                );
            }

            reservation.setStripePaymentIntentId(null);
        }


        long amountInGrosz = BigDecimal
                .valueOf(reservation.getProductOffer().getPrice())
                .movePointRight(2)
                .longValueExact();

        PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                        .setAmount(amountInGrosz)
                        .setCurrency("pln")
                        .addPaymentMethodType("card")
                        .putMetadata(
                                "reservationId",
                                reservation.getId().toString()
                        )
                        .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);
        reservation.setStripePaymentIntentId(paymentIntent.getId());

        return new PaymentIntentResponse(
                paymentIntent.getId(),
                paymentIntent.getClientSecret()
        );
    }


    @Transactional
    public void confirmPaid(Long reservationId) {

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new NoSuchElementException("no reservation found"));


        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            logger.warn(
                    "Payment succeeded for cancelled reservation {}",
                    reservationId
            );
            return;
        }

        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setPaymentExpiresAt(null);

        emailService.sendPurchaseConfirmation(reservationId);
    }
}
