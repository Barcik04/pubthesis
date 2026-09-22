package com.example.services_management_system.utils.email;

import com.example.services_management_system.product.reservation.Reservation;
import com.example.services_management_system.product.reservation.ReservationRepository;
import com.example.services_management_system.product.reservation.ReservationService;
import com.example.services_management_system.product.reservation.dto.ReservationWithUserDto;
import com.example.services_management_system.user.User;
import com.example.services_management_system.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final EmailSender emailSender;
    private final ReservationRepository reservationRepository;
    private final String frontendUrl;


    public EmailService(EmailSender emailSender, ReservationRepository reservationRepository, @Value("${app.frontend-url}") String frontendUrl) {
        this.emailSender = emailSender;
        this.reservationRepository = reservationRepository;
        this.frontendUrl = frontendUrl;
    }

    public void sendReminderEmail() {

        List<ReservationWithUserDto> reservations = reservationRepository.findUpcomingReservationsWithUsernameWithin24h(
                LocalDateTime.now(),
                LocalDateTime.now().plusDays(1)
        );

        log.info("Found {} upcoming reservations for reminder email", reservations.size());

        for (ReservationWithUserDto res : reservations) {
            String subject = "Reminder: Your reservation is coming up";

            String body = """
                Hello,

                This is a friendly reminder that your reservation is coming up soon.

                Reservation details:
                Service: %s
                Date and time: %s
                Duration: %d minutes
                Price: %.2f PLN

                Please make sure to arrive on time.

                Best regards,
                Services Management System
                """.formatted(
                    res.offerName(),
                    res.startTime(),
                    res.durationMinutes(),
                    res.offerPrice()
            );

            emailSender.send(
                res.username(),
                    subject,
                    body
            );
        }

    }







    public void sendGuestPaymentLink(Reservation reservation) {
        String paymentLink = UriComponentsBuilder
                .fromUriString(frontendUrl)
                .path("/payment")
                .queryParam(
                        "reservationId",
                        reservation.getId()
                )
                .queryParam(
                        "token",
                        reservation.getGuestPaymentToken()
                )
                .build()
                .encode()
                .toUriString();

        String subject =
                "Complete your reservation payment";

        String body = """
                Hello %s,

                Your reservation has been created, but the payment has not been completed yet.

                Reservation date: %s

                Use the following link to complete your payment:

                %s

                The link is valid until the payment time  (10 minutes).

                Best regards,
                Services Management System
                """.formatted(
                reservation.getGuestFirstName(),
                reservation.getStartTime(),
                paymentLink
        );

        emailSender.send(
                reservation.getEmail(),
                subject,
                body
        );

        log.info(
                "Guest payment email sent for reservation {}",
                reservation.getId()
        );
    }


    public void sendPurchaseConfirmation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new NoSuchElementException("no reservation found"));
        String email;

        if (reservation.getEmail() == null) {
            email = reservation.getUser().getUsername();
        } else {
            email = reservation.getEmail();
        }

        String subject =
                "Payment confirmed - reservation #" +
                        reservation.getId();

        String body = """
        Hello,

        Your payment has been successfully confirmed and your reservation is now complete.

        Reservation details:
        Reservation number: %d
        Service: %s
        Date and time: %s
        Price: %.2f PLN

        Thank you for your payment.

        Best regards,
        Services Management System
        """.formatted(
                reservation.getId(),
                reservation.getProductOffer().getName(),
                reservation.getStartTime(),
                reservation.getProductOffer().getPrice()
        );


        emailSender.send(
                email,
                subject,
                body
        );

        log.info(
                "Reservation confirmation sent {}",
                reservation.getId()
        );
    }
}
