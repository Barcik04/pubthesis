package com.example.services_management_system.security;


import com.example.services_management_system.security.jwt.AuthEntryPointJwt;
import com.nimbusds.jose.jwk.OctetSequenceKey;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;


import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    @Bean
    SecretKey jwtKey(@Value("${spring.app.jwtSecret}") String secret) {
        return new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey key) {
        return NimbusJwtDecoder.withSecretKey(key).build();
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey key) {
        OctetSequenceKey jwk = new OctetSequenceKey.Builder(key).build();
        JWKSource<SecurityContext> jwkSource = (selector, ctx) -> List.of(jwk);
        return new NimbusJwtEncoder(jwkSource);
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, AuthEntryPointJwt entryPoint) throws Exception {
        var scopes = new JwtGrantedAuthoritiesConverter();
        scopes.setAuthorityPrefix("");
        scopes.setAuthoritiesClaimName("scope");

        var jwtConv = new JwtAuthenticationConverter();
        jwtConv.setJwtGrantedAuthoritiesConverter(scopes);

        BearerTokenResolver resolver = request -> {
            String path = request.getRequestURI();
            if (path.startsWith("/auth/")) return null;
            return new DefaultBearerTokenResolver().resolve(request);
        };


        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .ignoringRequestMatchers(
                                "/auth/**",
                                "/reservations/guest",
                                "/invoice/**",
                                "/payments/guest/payment-intent",
                                "/payments/webhook"
                        ))
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/auth/**",
                                "/error",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/actuator/**",
                                "/uploads/**",
                                "locations/cities/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/products", "/types", "/products/{productId}", "/offers/{offerId}", "/reservations/{offerId}").permitAll()
                        .requestMatchers(HttpMethod.POST, "/reservations/guest", "/invoice/{reservationId}", "/payments/guest/payment-intent", "/payments/webhook").permitAll()
                        .requestMatchers(HttpMethod.POST, "/products", "/reservations").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/products/{productId}").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/products/{productId}", "reservations/**").authenticated()
                        .requestMatchers("/offers/**", "/availability/**", "/payments/**").authenticated()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth -> oauth
                        .bearerTokenResolver(resolver)
                        .jwt(j -> j.jwtAuthenticationConverter(jwtConv))
                )
                .exceptionHandling(ex -> ex.authenticationEntryPoint(entryPoint));


        return http.build();
    }
}