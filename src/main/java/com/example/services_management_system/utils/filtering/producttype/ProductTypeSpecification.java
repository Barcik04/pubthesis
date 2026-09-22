package com.example.services_management_system.utils.filtering.producttype;

import com.example.services_management_system.product.product.dto.ProductTypeFilter;
import com.example.services_management_system.product.producttype.ProductType;
import org.springframework.data.jpa.domain.Specification;

public class ProductTypeSpecification {
    public static Specification<ProductType> textSearch(ProductTypeFilter filter) {
        return (root, query, criteriaBuilder) -> {
            var predicate = criteriaBuilder.conjunction();

            if (filter != null && filter.getType() != null && !filter.getType().isBlank()) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("name")),
                                "%" + filter.getType().toLowerCase() + "%"
                        )
                );
            }

            return predicate;
        };
    }

}
