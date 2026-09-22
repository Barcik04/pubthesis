package com.example.services_management_system.product.reservation;

import com.example.services_management_system.payment.invoice.InvoiceRequest;
import com.example.services_management_system.product.productoffers.ProductOffer;
import com.example.services_management_system.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;


@Entity
@Table(name = "reservations")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "user_reservation_id_fk"))
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_offer_id", foreignKey = @ForeignKey(name = "offer_reservation_id_fk"))
    private ProductOffer productOffer;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(name = "guest_first_name", length = 100)
    private String guestFirstName;

    @Column(name = "guest_last_name", length = 100)
    private String guestLastName;

    @Column(length = 100)
    @Email(message = "invalid email")
    private String email;

    @OneToOne(mappedBy = "reservation", orphanRemoval = true)
    @JsonIgnore
    private InvoiceRequest invoiceRequest;

    @Column(name = "guest_payment_token", unique = true, length = 36)
    private String guestPaymentToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReservationStatus status = ReservationStatus.PENDING_PAYMENT;

    @Column(name = "payment_expires_at")
    private Instant paymentExpiresAt;

    @Column(name = "stripe_payment_intent_id", length = 255)
    private String stripePaymentIntentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod payment_method;


    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }

        if (status == null) {
            status = ReservationStatus.PENDING_PAYMENT;
        }

        if (status == ReservationStatus.PENDING_PAYMENT
                && paymentExpiresAt == null) {
            paymentExpiresAt = Instant.now().plus(Duration.ofMinutes(25));
        }
    }

    public Reservation() {
    }

    public Reservation(ProductOffer productOffer, LocalDateTime startTime, LocalDateTime endTime) {
        this.productOffer = productOffer;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Reservation(ProductOffer productOffer, LocalDateTime startTime, LocalDateTime endTime, String guestFirstName, String guestLastName, String email) {
        this.productOffer = productOffer;
        this.startTime = startTime;
        this.endTime = endTime;
        this.guestFirstName = guestFirstName;
        this.guestLastName = guestLastName;
        this.email = email;
    }

    public InvoiceRequest getInvoiceRequest() {
        return invoiceRequest;
    }

    public void setInvoiceRequest(InvoiceRequest invoiceRequest) {
        this.invoiceRequest = invoiceRequest;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public ProductOffer getProductOffer() {
        return productOffer;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }


    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setProductOffer(ProductOffer productOffer) {
        this.productOffer = productOffer;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getGuestFirstName() {
        return guestFirstName;
    }

    public void setGuestFirstName(String guestFirstName) {
        this.guestFirstName = guestFirstName;
    }

    public String getGuestLastName() {
        return guestLastName;
    }

    public void setGuestLastName(String guestLastName) {
        this.guestLastName = guestLastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getGuestPaymentToken() {
        return guestPaymentToken;
    }

    public void setGuestPaymentToken(String guestPaymentToken) {
        this.guestPaymentToken = guestPaymentToken;
    }


    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public String getStripePaymentIntentId() {
        return stripePaymentIntentId;
    }

    public void setStripePaymentIntentId(String stripePaymentIntentId) {
        this.stripePaymentIntentId = stripePaymentIntentId;
    }

    public Instant getPaymentExpiresAt() {
        return paymentExpiresAt;
    }

    public void setPaymentExpiresAt(Instant paymentExpiresAt) {
        this.paymentExpiresAt = paymentExpiresAt;
    }

    public PaymentMethod getPayment_method() {
        return payment_method;
    }

    public void setPayment_method(PaymentMethod payment_method) {
        this.payment_method = payment_method;
    }
}
