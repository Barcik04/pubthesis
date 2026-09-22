package com.example.services_management_system.utils.nominatim.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NominatimPlaceResponse(

        @JsonProperty("place_id")
        Long placeId,

        String name,

        @JsonProperty("display_name")
        String displayName,

        String lat,

        String lon,

        String type,

        @JsonProperty("addresstype")
        String addressType
) {
}
