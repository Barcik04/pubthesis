package com.example.services_management_system.utils.scheduling;

import com.example.services_management_system.utils.email.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class EmailReservationReminderScheduler {


    private final EmailService emailService;

    public EmailReservationReminderScheduler(EmailService emailService) {
        this.emailService = emailService;
    }

    @Scheduled(cron = "0 */10 * * * *", zone = "Europe/Warsaw")
    @Transactional(readOnly = true)
    public void run() {

        emailService.sendReminderEmail();
    }
}