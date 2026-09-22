package com.example.services_management_system.payment.invoice.dto;

import com.example.services_management_system.payment.invoice.InvoiceRequest;
import com.example.services_management_system.payment.invoice.InvoiceRequestStatus;

public class InvoiceResultDto {

    private Long id;
    private Long reservationId;
    private String buyerName;
    private String buyerNip;
    private String street;
    private String postalCode;
    private String city;
    private String country;
    private String email;
    private InvoiceRequestStatus status;

    public InvoiceResultDto(InvoiceRequest invoiceRequest) {
        this.id = invoiceRequest.getId();
        this.reservationId = invoiceRequest.getReservation().getId();
        this.buyerName = invoiceRequest.getBuyerName();
        this.buyerNip = invoiceRequest.getBuyerNip();
        this.street = invoiceRequest.getStreet();
        this.postalCode = invoiceRequest.getPostalCode();
        this.city = invoiceRequest.getCity();
        this.country = invoiceRequest.getCountry();
        this.email = invoiceRequest.getEmail();
        this.status = invoiceRequest.getStatus();
    }

    public InvoiceResultDto(Long id, Long reservationId, String buyerName, String buyerNip, String street, String postalCode, String city, String country, String email, InvoiceRequestStatus status) {
        this.id = id;
        this.reservationId = reservationId;
        this.buyerName = buyerName;
        this.buyerNip = buyerNip;
        this.street = street;
        this.postalCode = postalCode;
        this.city = city;
        this.country = country;
        this.email = email;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public String getBuyerNip() {
        return buyerNip;
    }

    public String getStreet() {
        return street;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public String getCity() {
        return city;
    }

    public String getCountry() {
        return country;
    }

    public String getEmail() {
        return email;
    }

    public InvoiceRequestStatus getStatus() {
        return status;
    }
}
