package com.example.services_management_system.integration;

import com.example.services_management_system.product.product.Product;
import com.example.services_management_system.product.product.ProductRepository;
import com.example.services_management_system.product.productoffers.ProductOffer;
import com.example.services_management_system.product.productoffers.ProductOfferRepository;
import com.example.services_management_system.user.User;
import com.example.services_management_system.user.UserRepository;
import com.example.services_management_system.utils.email.EmailSender;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Boots the whole application against a real PostgreSQL (Testcontainers) so Flyway migrations,
 * JPQL queries and the security filter chain are exercised exactly as in production.
 * Only the outgoing e-mail sender is mocked.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

    // Started once and shared by every integration test class (the Spring context is cached too).
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:17-alpine");

    static {
        POSTGRES.start();
    }

    @Autowired
    protected MockMvc mockMvc;
    @Autowired
    protected JdbcTemplate jdbcTemplate;
    @Autowired
    protected UserRepository userRepository;
    @Autowired
    protected ProductRepository productRepository;
    @Autowired
    protected ProductOfferRepository productOfferRepository;
    @Autowired
    protected PasswordEncoder passwordEncoder;

    @MockitoBean
    protected EmailSender emailSender;

    @BeforeEach
    void cleanDatabase() {
        jdbcTemplate.execute("TRUNCATE TABLE users, products, product_offers, reservations, invoice_requests RESTART IDENTITY CASCADE");
    }

    protected User createUser(String email, String password, String firstName, String lastName) {
        return userRepository.save(new User(email, passwordEncoder.encode(password), firstName, lastName));
    }

    protected ProductOffer createOffer(User owner, double price, int durationMinutes, boolean invoiceAvailable) {
        Product product = productRepository.save(
                new Product("Barber", "desc", 50.0, owner, null, "PL", "Warsaw", "Main", "00-001", "1", null, null)
        );
        ProductOffer offer = new ProductOffer("Haircut", "short", price, durationMinutes, true);
        offer.setInvoiceAvailable(invoiceAvailable);
        product.addOffer(offer);
        return productOfferRepository.save(offer);
    }
}
