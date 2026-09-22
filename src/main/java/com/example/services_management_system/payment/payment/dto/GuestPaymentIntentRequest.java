package com.example.services_management_system.payment.payment.dto;

public record GuestPaymentIntentRequest(
        Long reservationId,
        String guestPaymentToken
) {
}
