package com.example.services_management_system.product.product.dto;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ProductUpdateDTO(
        @Size(max = 100, message = "name cannot be longer that 100 characters")
        String name,

        @Size(max = 2048, message = "description cannot be longer that 2048 characters")
        String description,

        @PositiveOrZero(message = "price cannot be negative")
        Double price,

        @Size(max = 100, message = "type cannot be longer that 100 characters")
        List<String> types,

        String country,

        String city,

        String street,

        String postalCode,

        String houseNumber
) {
}
