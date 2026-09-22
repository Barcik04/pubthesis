package com.example.services_management_system.product.reservation.dto;

import com.example.services_management_system.payment.invoice.dto.InvoiceRequestCreateDto;
import jakarta.validation.Valid;

public record ReservationAndInvoiceCreateDto(
        @Valid ReservationCreateDto reservationCreateDto,
        @Valid InvoiceRequestCreateDto invoiceRequestCreateDto
        ) {

}
