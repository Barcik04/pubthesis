package com.example.services_management_system.payment.payment.dto;

public record PaymentIntentResponse(
        String paymentIntentId,
        String clientSecret
) {
}
