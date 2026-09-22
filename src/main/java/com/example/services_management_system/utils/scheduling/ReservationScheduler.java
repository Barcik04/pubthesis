package com.example.services_management_system.utils.scheduling;

import com.example.services_management_system.product.reservation.ReservationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class ReservationScheduler {
    private static final Logger logger =
            LoggerFactory.getLogger(ReservationScheduler.class);

    private final ReservationService reservationService;

    public ReservationScheduler(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @Scheduled(fixedRate = 60_000)
    public void deleteAllExpiredPaymentReservations() {
        reservationService.deleteAllExpiredPaymentReservations();
        logger.info("deletion of expired reservations conducted");
    }
}
