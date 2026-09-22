package com.example.services_management_system.product.product;

import com.example.services_management_system.product.product.dto.ProductResultDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Page<Product> findAllByUser_Id(Long userId, Pageable pageable);
    @Query("""
        SELECT p FROM Product p WHERE p.id = :productId AND p.user.id = :userId
    """)
    Optional<Product> findByIdAndUserId(@Param("productId") Long productId, @Param("userId") Long userId);


}
