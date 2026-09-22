package com.example.services_management_system.security.jwt;


import com.example.services_management_system.user.Role;

import com.example.services_management_system.user.User;
import com.example.services_management_system.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtEncoder jwtEncoder;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final long expirationMs;

    public AuthController(
            AuthenticationManager authManager,
            JwtEncoder jwtEncoder,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${spring.app.jwtExpirationMs:3600000}") long expirationMs
    ) {
        this.authManager = authManager;
        this.jwtEncoder = jwtEncoder;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.expirationMs = expirationMs;
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody @Valid LoginRequest req) {
        try {
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
            UserDetails principal = (UserDetails) auth.getPrincipal();

            // authorities -> "scope" (space-separated), np. "USER_READ USER_WRITE"
            StringJoiner scope = new StringJoiner(" ");
            for (GrantedAuthority ga : principal.getAuthorities()) scope.add(ga.getAuthority());

            Instant now = Instant.now();
            JwtClaimsSet claims = JwtClaimsSet.builder()
                    .subject(principal.getUsername())               // email
                    .issuedAt(now)
                    .expiresAt(now.plusMillis(expirationMs))
                    .claim("scope", scope.toString())
                    .build();

            JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
            String token = jwtEncoder
                    .encode(JwtEncoderParameters.from(header, claims))
                    .getTokenValue();

            List<String> roles = principal.getAuthorities()
                    .stream().map(GrantedAuthority::getAuthority).toList();

            return ResponseEntity.ok(new LoginResponse(token, principal.getUsername(), roles));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(Map.of("message", "Bad credentials"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest req) {
        if (userRepository.existsByUsername(req.email())) {
            return ResponseEntity.badRequest().body(Map.of("message", "email already taken"));
        }
        User user = new User(
                req.email(),
                passwordEncoder.encode(req.password()),
                req.firstName(),
                req.lastName()
        );
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Registered"));
    }

    @GetMapping("/ping")
    public String ping() {
        return "ok";
    }
}

