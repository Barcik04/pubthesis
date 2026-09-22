package com.example.services_management_system.payment.invoice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceRequestRepository extends JpaRepository<InvoiceRequest, Long>, JpaSpecificationExecutor<InvoiceRequest> {
    Page<InvoiceRequest> findAllByReservation_User_Id(Long userId, Pageable pageable);
}
