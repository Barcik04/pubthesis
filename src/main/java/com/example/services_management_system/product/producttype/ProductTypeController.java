package com.example.services_management_system.product.producttype;

import com.example.services_management_system.product.product.dto.ProductTypeFilter;
import com.example.services_management_system.product.producttype.dto.ProductTypeResultDTO;
import jakarta.annotation.security.PermitAll;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/types")
public class ProductTypeController {
    private final ProductTypeService productTypeService;

    public ProductTypeController(ProductTypeService productTypeService) {
        this.productTypeService = productTypeService;
    }

    @GetMapping
    @PermitAll
    public List<ProductTypeResultDTO> findAllTypes(@ParameterObject @ModelAttribute ProductTypeFilter filter) {
        return productTypeService.findAllProductTypes(filter);
    }
}
