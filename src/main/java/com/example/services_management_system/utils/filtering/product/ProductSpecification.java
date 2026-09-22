package com.example.services_management_system.utils.filtering.product;

import com.example.services_management_system.product.product.Product;
import com.example.services_management_system.product.product.dto.ProductFilter;
import com.example.services_management_system.product.producttype.ProductType;
import com.example.services_management_system.product.producttyperelation.ProductTypeRelation;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {

    public static Specification<Product> textSearch(ProductFilter filter) {
        return (root, query, criteriaBuilder) -> {
            var predicate = criteriaBuilder.conjunction();

            if (filter != null && filter.getName() != null && !filter.getName().isBlank()) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("name")),
                                "%" + filter.getName().toLowerCase() + "%"
                        )
                );
            }

            return predicate;
        };
    }


    public static Specification<Product> hasTypes(ProductFilter filter) {
        return (root, query, criteriaBuilder) -> {
            if (filter == null || filter.getTypes() == null || filter.getTypes().isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            query.distinct(true);

            Join<Product, ProductTypeRelation> productTypeRelationJoin = root.join("productTypes");
            Join<ProductTypeRelation, ProductType> productTypeJoin =
                    productTypeRelationJoin.join("productType");

            return productTypeJoin.get("type").in(filter.getTypes());
        };
    }




    public static Specification<Product> priceBetween(ProductFilter filter) {
        return (root, query, criteriaBuilder) -> {
            var predicate = criteriaBuilder.conjunction();

            if (filter == null) {
                return predicate;
            }

            if (filter.getMinPrice() != null) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.greaterThanOrEqualTo(root.get("price"), filter.getMinPrice())
                );
            }

            if (filter.getMaxPrice() != null) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.lessThanOrEqualTo(root.get("price"), filter.getMaxPrice())
                );
            }

            return predicate;
        };
    }


    public static Specification<Product> hasCity(String city) {
        return (root, query, criteriaBuilder) -> {
            if (city == null || city.isBlank()) {
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.equal(
                    criteriaBuilder.lower(root.get("city")),
                    city.trim().toLowerCase()
            );
        };
    }
}