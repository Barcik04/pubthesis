package com.example.services_management_system.payment.invoice;


import com.example.services_management_system.product.reservation.Reservation;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "invoice_requests")
public class InvoiceRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reservation_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "invoice_reservation_id_fk"))
    private Reservation reservation;

    @Column(nullable = false, length = 200)
    private String buyerName;

    @Column(length = 10)
    private String buyerNip;

    @Column(nullable = false, length = 200)
    private String street;

    @Column(nullable = false, length = 20)
    private String postalCode;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(nullable = false, length = 254)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvoiceRequestStatus status = InvoiceRequestStatus.REQUESTED;

    @Column(nullable = false)
    private Instant requestedAt;

    private Instant issuedAt;



    public InvoiceRequest(String buyerName, String buyerNip, String street, String postalCode, String city, String country, String email) {
        this.buyerName = buyerName;
        this.buyerNip = buyerNip;
        this.street = street;
        this.postalCode = postalCode;
        this.city = city;
        this.country = country;
        this.email = email;
    }

    public InvoiceRequest() {
    }

    @PrePersist
    void prePersist() {
        requestedAt = Instant.now();
        status = InvoiceRequestStatus.REQUESTED;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Reservation getReservation() {
        return reservation;
    }

    public void setReservation(Reservation reservation) {
        this.reservation = reservation;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
    }

    public String getBuyerNip() {
        return buyerNip;
    }

    public void setBuyerNip(String buyerNip) {
        this.buyerNip = buyerNip;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public InvoiceRequestStatus getStatus() {
        return status;
    }

    public void setStatus(InvoiceRequestStatus status) {
        this.status = status;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(Instant requestedAt) {
        this.requestedAt = requestedAt;
    }

    public Instant getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(Instant issuedAt) {
        this.issuedAt = issuedAt;
    }
}
