package com.example.services_management_system.utils.nominatim.dto;

import java.math.BigDecimal;

public record CitySearchResultDTO(
        String name,
        String displayName,
        BigDecimal latitude,
        BigDecimal longitude
) {
}
