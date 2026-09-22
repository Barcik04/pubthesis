package com.example.services_management_system.product.reservation;

import com.example.services_management_system.payment.invoice.InvoiceRequest;
import com.example.services_management_system.payment.invoice.dto.InvoiceResultDto;
import com.example.services_management_system.product.reservation.dto.ReservationResultGuestDto;
import com.example.services_management_system.product.reservation.dto.ReservationWithUserDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long>, JpaSpecificationExecutor<Reservation> {
    @Query("""
        SELECT COUNT(r) > 0
        FROM Reservation r
        WHERE r.productOffer.id = :offerId
          AND r.startTime < :end
          AND r.endTime > :start
    """)
    boolean findOverlappingReservations(
            Long offerId,
            LocalDateTime start,
            LocalDateTime end
    );

    List<Reservation> findAllByUser_Id(Long userId);

    @Query("""
        SELECT new com.example.services_management_system.product.reservation.dto.ReservationWithUserDto(
            r.id,
            r.startTime,
            r.endTime,
            u.username,
            o.name,
            o.price,
            o.durationMinutes
        )
        FROM User u
        JOIN u.products p
        JOIN p.offers o
        JOIN o.reservations r
        WHERE r.startTime BETWEEN :now AND :tomorrow
    """)
    List<ReservationWithUserDto> findUpcomingReservationsWithUsernameWithin24h(
            LocalDateTime now,
            LocalDateTime tomorrow
    );

    Optional<Reservation> findByIdAndUser_Id(Long reservationId, Long userId);

    Page<Reservation> findAllByUser_Id(Long userId, Pageable pageable);

    Optional<Reservation> findByIdAndGuestPaymentToken(Long reservationId, String paymentToken);

    @Modifying
    @Transactional
    @Query("""
        DELETE FROM Reservation r
        WHERE r.status <> :status
          AND r.paymentExpiresAt < :time
    """)
    void deleteAllByStatusAndPaymentExpiresAtBefore(ReservationStatus status, Instant time);}
