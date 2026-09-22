package com.example.services_management_system.product.offer_avail_dates;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductOfferAvailabilityRepository extends JpaRepository<ProductOfferAvailability, Long> {
    @Modifying
    @Query("""
        DELETE FROM ProductOfferAvailability availability
        WHERE availability.productOffer.id = :offerId
    """)
    void deleteAvailabilitiesAllByOfferId(@Param("offerId") Long offerId);
}
