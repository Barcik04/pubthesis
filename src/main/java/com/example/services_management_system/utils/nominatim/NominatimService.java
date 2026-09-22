package com.example.services_management_system.utils.nominatim;

import com.example.services_management_system.utils.nominatim.dto.CitySearchResultDTO;
import com.example.services_management_system.utils.nominatim.dto.GeocodeResultDTO;
import com.example.services_management_system.utils.nominatim.dto.NominatimPlaceResponse;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.math.BigDecimal;
import java.util.Optional;

@Service
public class NominatimService {

    private final RestClient nominatimRestClient;

    public NominatimService(RestClient nominatimRestClient) {
        this.nominatimRestClient = nominatimRestClient;
    }


    public List<CitySearchResultDTO> searchCities(String cityName) {
        if (cityName == null || cityName.isBlank()) {
            return List.of();
        }

        List<NominatimPlaceResponse> nominatimResults = nominatimRestClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("q", cityName.trim())
                        .queryParam("format", "jsonv2")
                        .queryParam("featureType", "city")
                        .queryParam("limit", 10)
                        .queryParam("accept-language", "pl")
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });

        if (nominatimResults == null) {
            return List.of();
        }

        return nominatimResults.stream()
                .map(place -> new CitySearchResultDTO(
                        place.name(),
                        place.displayName(),
                        new BigDecimal(place.lat()),
                        new BigDecimal(place.lon())
                ))
                .toList();
    }






    public Optional<GeocodeResultDTO> geocodeAddress(
            String country,
            String city,
            String street,
            String postalCode,
            String houseNumber
    ) {
        if (city == null || city.isBlank()) {
            return Optional.empty();
        }

        String streetQuery = buildStreetParam(street, houseNumber);

        List<NominatimPlaceResponse> results = nominatimRestClient
                .get()
                .uri(uriBuilder -> {
                    uriBuilder
                            .path("/search")
                            .queryParam("format", "jsonv2")
                            .queryParam("limit", 1)
                            .queryParam("accept-language", "pl")
                            .queryParam("city", city.trim());

                    if (!streetQuery.isBlank()) {
                        uriBuilder.queryParam("street", streetQuery);
                    }
                    if (postalCode != null && !postalCode.isBlank()) {
                        uriBuilder.queryParam("postalcode", postalCode.trim());
                    }
                    if (country != null && !country.isBlank()) {
                        uriBuilder.queryParam("country", country.trim());
                    }

                    return uriBuilder.build();
                })
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });

        if (results == null || results.isEmpty()) {
            return Optional.empty();
        }

        NominatimPlaceResponse best = results.getFirst();

        return Optional.of(new GeocodeResultDTO(
                new BigDecimal(best.lat()),
                new BigDecimal(best.lon())
        ));
    }

    private String buildStreetParam(String street, String houseNumber) {
        if (street == null || street.isBlank()) {
            return "";
        }
        if (houseNumber != null && !houseNumber.isBlank()) {
            return street.trim() + " " + houseNumber.trim();
        }
        return street.trim();
    }
}
