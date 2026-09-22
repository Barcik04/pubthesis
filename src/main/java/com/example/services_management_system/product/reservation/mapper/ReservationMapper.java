package com.example.services_management_system.product.reservation.mapper;

import com.example.services_management_system.product.reservation.Reservation;
import com.example.services_management_system.product.reservation.dto.ReservationResultWithOfferDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReservationMapper {
    Page<ReservationResultWithOfferDto> reservationsToPageDto(Page<Reservation> reservations, Pageable pageable);
}
