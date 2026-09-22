package com.example.services_management_system.utils.nominatim;

import com.example.services_management_system.utils.nominatim.dto.CitySearchResultDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/locations")
public class NominatimController {

    private final NominatimService nominatimService;

    public NominatimController(NominatimService nominatimService) {
        this.nominatimService = nominatimService;
    }

    @GetMapping("/cities")
    public List<CitySearchResultDTO> searchCities(
            @RequestParam String name
    ) {
        return nominatimService.searchCities(name);
    }
}
