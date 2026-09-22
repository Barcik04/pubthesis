package com.example.services_management_system.utils.filtering.reservation;

import com.example.services_management_system.product.productoffers.ProductOffer;
import com.example.services_management_system.product.reservation.Reservation;
import com.example.services_management_system.product.reservation.dto.ReservationFilter;
import com.example.services_management_system.user.User;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public class ReservationSpecification {

    public static Specification<Reservation> textSearch(
            ReservationFilter filter
    ) {
        return (root, query, criteriaBuilder) -> {
            var predicate = criteriaBuilder.conjunction();

            if (filter == null) {
                return predicate;
            }

            if (filter.getUsername() != null &&
                    !filter.getUsername().isBlank()) {

                Join<Reservation, User> user = root.join("user");

                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.like(
                                criteriaBuilder.lower(user.get("username")),
                                "%" + filter.getUsername().trim().toLowerCase() + "%"
                        )
                );
            }

            if (filter.getFirstName() != null &&
                    !filter.getFirstName().isBlank()) {

                Join<Reservation, User> user = root.join("user");

                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.like(
                                criteriaBuilder.lower(user.get("firstName")),
                                "%" + filter.getFirstName().trim().toLowerCase() + "%"
                        )
                );
            }

            if (filter.getLastName() != null &&
                    !filter.getLastName().isBlank()) {

                Join<Reservation, User> user = root.join("user");

                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.like(
                                criteriaBuilder.lower(user.get("lastName")),
                                "%" + filter.getLastName().trim().toLowerCase() + "%"
                        )
                );
            }

            if (filter.getOfferName() != null &&
                    !filter.getOfferName().isBlank()) {

                Join<Reservation, ProductOffer> offer =
                        root.join("productOffer");

                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.like(
                                criteriaBuilder.lower(offer.get("name")),
                                "%" + filter.getOfferName().trim().toLowerCase() + "%"
                        )
                );
            }

            return predicate;
        };
    }

    public static Specification<Reservation> durationMinutes(
            ReservationFilter filter
    ) {
        return (root, query, criteriaBuilder) -> {
            if (filter == null || filter.getDurationMinutes() == null) {
                return criteriaBuilder.conjunction();
            }

            Join<Reservation, ProductOffer> offer =
                    root.join("productOffer");

            return criteriaBuilder.equal(
                    offer.get("durationMinutes"),
                    filter.getDurationMinutes()
            );
        };
    }


    public static Specification<Reservation> hasUserId(Long userId) {
        return (root, query, cb) ->
                cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<Reservation> hasProductId(Long productId) {
        return (root, query, cb) ->
                cb.equal(
                        root.get("productOffer")
                                .get("product")
                                .get("id"),
                        productId
                );
    }
}