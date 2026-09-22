package com.example.services_management_system.product.productoffers;

import com.example.services_management_system.product.offer_avail_dates.ProductOfferAvailability;
import com.example.services_management_system.product.product.Product;
import com.example.services_management_system.product.reservation.Reservation;
import com.example.services_management_system.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "product_offers")
public class ProductOffer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "name of the product cannot be blank")
    @Size(max = 100, message = "name cannot be longer that 100 characters")
    private String name;

    @Column(length = 100)
    @Size(max = 100, message = "description cannot be longer that 100 characters")
    private String description;

    @PositiveOrZero(message = "price cannot be negative")
    private Double price;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", foreignKey = @ForeignKey(name = "product_offer_product_id_fk"))
    @JsonIgnore
    private Product product;

    @Positive(message = "Duration must be positive")
    @Column(nullable = false)
    private Integer durationMinutes;

    @OneToMany(mappedBy = "productOffer", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private Set<Reservation> reservations = new HashSet<>();

    @OneToMany(mappedBy = "productOffer", cascade = {CascadeType.ALL}, orphanRemoval = true)
    private Set<ProductOfferAvailability> availabilities = new HashSet<>();

    @Column(nullable = false)
    private Boolean invoiceAvailable = false;

    @Column(nullable = false, name = "cash_payment_availability")
    Boolean cashPaymentAvailability;

    public ProductOffer() {
    }

    public ProductOffer(String name, String description, Double price, Integer durationMinutes, Boolean cashPaymentAvailability) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.durationMinutes = durationMinutes;
        this.cashPaymentAvailability = cashPaymentAvailability;
    }


    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Boolean getInvoiceAvailable() {
        return invoiceAvailable;
    }

    public void setInvoiceAvailable(Boolean invoiceAvailable) {
        this.invoiceAvailable = invoiceAvailable;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Double getPrice() {
        return price;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public Set<Reservation> getReservations() {
        return reservations;
    }

    public void addReservation(Reservation reservation) {
        reservations.add(reservation);
        reservation.setProductOffer(this);
    }

    public Product getProduct() {
        return product;
    }

    public void addAvailability(ProductOfferAvailability availability) {
        availabilities.add(availability);
        availability.setProductOffer(this);
    }

    public Set<ProductOfferAvailability> getAvailabilities() {
        return availabilities;
    }

    public void setAvailabilities(Set<ProductOfferAvailability> availabilities) {
        this.availabilities = availabilities;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public void setReservations(Set<Reservation> reservations) {
        this.reservations = reservations;
    }

    public Boolean getCashPaymentAvailability() {
        return cashPaymentAvailability;
    }

    public void setCashPaymentAvailability(Boolean cashPaymentAvailability) {
        this.cashPaymentAvailability = cashPaymentAvailability;
    }
}
