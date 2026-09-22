package com.example.services_management_system.product.product.dto;

import com.example.services_management_system.product.productoffers.ProductOffer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Set;

public record ProductCreateDTO(
        @NotBlank(message = "name of the product cannot be blank")
        @Size(max = 100, message = "name cannot be longer that 100 characters")
        String name,

        @Size(max = 2048, message = "description cannot be longer that 2048 characters")
        String description,

        @PositiveOrZero(message = "price cannot be negative")
        Double price,

        @Size(max = 100, message = "type cannot be longer that 100 characters")
        List<String> types,

        Set<ProductOffer> offers,

        String country,

        String city,

        String street,

        String postalCode,

        String houseNumber

) {
}
