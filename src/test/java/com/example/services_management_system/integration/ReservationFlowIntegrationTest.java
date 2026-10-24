package com.example.services_management_system.integration;

import com.example.services_management_system.payment.invoice.InvoiceRequestRepository;
import com.example.services_management_system.payment.invoice.dto.InvoiceRequestCreateDto;
import com.example.services_management_system.product.productoffers.ProductOffer;
import com.example.services_management_system.product.reservation.*;
import com.example.services_management_system.product.reservation.dto.*;
import com.example.services_management_system.user.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ReservationFlowIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private ReservationRepository reservationRepository;
    @Autowired
    private InvoiceRequestRepository invoiceRequestRepository;
    @Autowired
    private ReservationService reservationService;

    private User customer;
    private User provider;
    private ProductOffer offer;
    private LocalDateTime start;

    @BeforeEach
    void setUp() {
        customer = createUser("customer@example.com", "secret123", "Jan", "Kowalski");
        provider = createUser("provider@example.com", "secret123", "Anna", "Nowak");
        offer = createOffer(provider, 80.0, 60, true);
        start = LocalDateTime.now().plusDays(2).truncatedTo(ChronoUnit.MINUTES);
    }

    private static RequestPostProcessor asUser(User user, String... authorities) {
        return jwt()
                .jwt(j -> j.subject(user.getUsername()))
                .authorities(Arrays.stream(authorities).map(SimpleGrantedAuthority::new).toArray(GrantedAuthority[]::new));
    }

    private ResultActions reserve(LocalDateTime startTime, InvoiceRequestCreateDto invoice) throws Exception {
        ReservationAndInvoiceCreateDto dto = new ReservationAndInvoiceCreateDto(
                new ReservationCreateDto(offer.getId(), startTime, PaymentMethod.CARD),
                invoice
        );
        return mockMvc.perform(post("/reservations")
                .with(asUser(customer, "USER"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)));
    }

    @Test
    void userCreatesReservation_persistedAsPendingPaymentWithExpiry() throws Exception {
        reserve(start, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_PAYMENT"))
                .andExpect(jsonPath("$.productId").value(offer.getProduct().getId()));

        assertThat(reservationRepository.findAllByUser_Id(customer.getId()))
                .singleElement()
                .satisfies(r -> {
                    assertThat(r.getStartTime()).isEqualTo(start);
                    assertThat(r.getEndTime()).isEqualTo(start.plusMinutes(60));
                    assertThat(r.getStatus()).isEqualTo(ReservationStatus.PENDING_PAYMENT);
                    assertThat(r.getPaymentExpiresAt())
                            .isBetween(Instant.now().plus(Duration.ofMinutes(14)), Instant.now().plus(Duration.ofMinutes(16)));
                });
    }

    @Test
    void userCreatesReservationWithInvoice_invoiceRequestIsStored() throws Exception {
        InvoiceRequestCreateDto invoice = new InvoiceRequestCreateDto("ACME", "1234567890", "Street 1", "00-001", "Warsaw", "Poland", "acme@example.com");

        reserve(start, invoice).andExpect(status().isOk());

        assertThat(invoiceRequestRepository.findAll())
                .singleElement()
                .satisfies(i -> assertThat(i.getBuyerName()).isEqualTo("ACME"));
    }

    @Test
    void overlappingReservation_isRejectedWithConflict() throws Exception {
        reserve(start, null).andExpect(status().isOk());

        // starts in the middle of the first 60-minute slot
        reserve(start.plusMinutes(30), null).andExpect(status().isConflict());
        // back-to-back slot does not overlap
        reserve(start.plusMinutes(60), null).andExpect(status().isOk());

        assertThat(reservationRepository.count()).isEqualTo(2);
    }

    @Test
    void reservationInThePast_isForbidden() throws Exception {
        reserve(LocalDateTime.now().minusHours(1), null).andExpect(status().isForbidden());

        assertThat(reservationRepository.count()).isZero();
    }

    @Test
    void reservationWithoutToken_isUnauthorized() throws Exception {
        mockMvc.perform(post("/reservations")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void guestReservation_isCreatedWithoutLoginAndPaymentLinkIsEmailed() throws Exception {
        GuestReservationAndInvoiceDto dto = new GuestReservationAndInvoiceDto(
                new ReservationGuestCreateDto(offer.getId(), start, "Guest", "Person", "guest@example.com", PaymentMethod.CARD),
                null
        );

        String body = mockMvc.perform(post("/reservations/guest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(body).get("guestPaymentToken").asText();
        Long reservationId = objectMapper.readTree(body).get("id").asLong();

        assertThat(reservationRepository.findByIdAndGuestPaymentToken(reservationId, token)).isPresent();
        verify(emailSender).send(eq("guest@example.com"), anyString(), contains("token=" + token));
    }

    @Test
    void providerRevokesReservationOnOwnProduct_othersCannot() throws Exception {
        reserve(start, null).andExpect(status().isOk());
        Long reservationId = reservationRepository.findAllByUser_Id(customer.getId()).getFirst().getId();

        User otherProvider = createUser("other@example.com", "secret123", "Piotr", "Zielinski");

        mockMvc.perform(delete("/reservations/revoke/{id}", reservationId)
                        .with(asUser(otherProvider, "PROVIDER", "USER"))
                        .with(csrf()))
                .andExpect(status().isConflict());
        assertThat(reservationRepository.existsById(reservationId)).isTrue();

        mockMvc.perform(delete("/reservations/revoke/{id}", reservationId)
                        .with(asUser(provider, "PROVIDER", "USER"))
                        .with(csrf()))
                .andExpect(status().isOk());
        assertThat(reservationRepository.existsById(reservationId)).isFalse();
    }

    @Test
    void expiredUnpaidCardReservationsAreDeleted_cashAndConfirmedAreKept() {
        Reservation expiredCard = saveReservation(start, PaymentMethod.CARD, ReservationStatus.PENDING_PAYMENT, Instant.now().minusSeconds(60));
        Reservation expiredCash = saveReservation(start.plusHours(1), PaymentMethod.CASH, ReservationStatus.PENDING_PAYMENT, Instant.now().minusSeconds(60));
        Reservation confirmed = saveReservation(start.plusHours(2), PaymentMethod.CARD, ReservationStatus.CONFIRMED, Instant.now().minusSeconds(60));
        Reservation stillPayable = saveReservation(start.plusHours(3), PaymentMethod.CARD, ReservationStatus.PENDING_PAYMENT, Instant.now().plusSeconds(600));

        reservationService.deleteAllExpiredPaymentReservations();

        assertThat(reservationRepository.existsById(expiredCard.getId())).isFalse();
        assertThat(reservationRepository.existsById(expiredCash.getId())).isTrue();
        assertThat(reservationRepository.existsById(confirmed.getId())).isTrue();
        assertThat(reservationRepository.existsById(stillPayable.getId())).isTrue();
        verify(emailSender, never()).send(anyString(), anyString(), anyString());
    }

    private Reservation saveReservation(LocalDateTime startTime, PaymentMethod method, ReservationStatus status, Instant expiresAt) {
        Reservation reservation = new Reservation(offer, startTime, startTime.plusMinutes(60));
        reservation.setUser(customer);
        reservation.setPayment_method(method);
        reservation.setStatus(status);
        reservation.setPaymentExpiresAt(expiresAt);
        return reservationRepository.save(reservation);
    }
}
