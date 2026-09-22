package com.example.services_management_system.payment.invoice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record InvoiceRequestCreateDto(
        @NotBlank(message = "buyers name cannot be blank")
        @Size(max = 200, message = "name cannot be longer that 100 characters")
        String buyerName,

        @Size(min = 10, max = 10, message = "NIP has to be 10 symbols")
        String buyerNip,

        @Size(max = 200, message = "street name cannot be longer that 200 characters")
        String street,

        @NotBlank(message = "postal code cannot be blank")
        @Size(max = 20, message = "postal code cannot be longer that 200 characters")
        String postalCode,

        @NotBlank(message = "city cannot be blank")
        @Size(max = 200, message = "city cannot be longer that 200 characters")
        String city,

        @NotBlank(message = "country cannot be blank")
        @Size(max = 100, message = "city cannot be longer that 100 characters")
        String country,

        @NotBlank(message = "email cannot be blank")
        @Size(max = 254, message = "email cannot be longer that 254 characters")
        @Email(message = "not a valid email")
        String email
        ) {
}
