package com.example.services_management_system.product.producttyperelation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductTypeRelationRepository extends JpaRepository<ProductTypeRelation, Long> {
}
