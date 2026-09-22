package com.example.services_management_system.product.productoffers;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface ProductOfferRepository extends JpaRepository<ProductOffer, Long> {
    boolean existsByIdAndProduct_User_Id(Long offerId, Long userId);
}
