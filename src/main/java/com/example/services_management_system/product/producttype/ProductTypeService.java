package com.example.services_management_system.product.producttype;

import com.example.services_management_system.product.product.dto.ProductTypeFilter;
import com.example.services_management_system.product.producttype.dto.ProductTypeResultDTO;
import com.example.services_management_system.utils.filtering.producttype.ProductTypeSpecification;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductTypeService {
    private ProductTypeRepository productTypeRepository;

    public ProductTypeService(ProductTypeRepository productTypeRepository) {
        this.productTypeRepository = productTypeRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductTypeResultDTO> findAllProductTypes(ProductTypeFilter filter) {
        Specification<ProductType> spec = Specification.allOf(
                ProductTypeSpecification.textSearch(filter)
        );

        return productTypeRepository.findAll(spec).stream()
                .map(type -> new ProductTypeResultDTO(
                        type.getId(),
                        type.getType()
                ))
                .toList();
    }
}
