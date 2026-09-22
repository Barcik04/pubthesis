package com.example.services_management_system.product.reservation.mapper;

import com.example.services_management_system.product.reservation.Reservation;
import com.example.services_management_system.product.reservation.dto.ReservationResultWithOfferDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ReservationImpl implements ReservationMapper{
    @Override
    public Page<ReservationResultWithOfferDto> reservationsToPageDto(Page<Reservation> reservations, Pageable pageable) {
        List<ReservationResultWithOfferDto> resultReservations = new ArrayList<>();

        for (Reservation r : reservations) {
            String email;
            String fistName;
            String lastname;

            if (r.getUser() != null && r.getUser().getUsername() != null) {
                email = r.getUser().getUsername();
            } else {
                email = r.getEmail();
            }


            if (r.getUser() != null && r.getUser().getFirstName() != null) {
                fistName = r.getUser().getFirstName();
            } else {
                fistName = r.getGuestFirstName();
            }

            if (r.getUser() != null && r.getUser().getLastName() != null) {
                lastname = r.getUser().getLastName();
            } else {
                lastname = r.getGuestLastName();
            }

            resultReservations.add(new ReservationResultWithOfferDto(
                    r.getId(),
                    r.getCreatedAt(),
                    r.getStartTime(),
                    r.getEndTime(),
                    email,
                    r.getStatus(),
                    r.getPayment_method(),
                    r.getProductOffer().getProduct().getName(),
                    r.getProductOffer().getDurationMinutes(),
                    r.getProductOffer().getDescription(),
                    r.getProductOffer().getName(),
                    r.getProductOffer().getPrice(),
                    fistName,
                    lastname
            ));
        }

        return new PageImpl<>(resultReservations, pageable, reservations.getSize());
    }
}
