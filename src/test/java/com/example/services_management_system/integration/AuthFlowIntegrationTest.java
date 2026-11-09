package com.example.services_management_system.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthFlowIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private ObjectMapper objectMapper;

    private void register(String email, String password, String firstName, String lastName, int expectedStatus) throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email,
                                "password", password,
                                "firstName", firstName,
                                "lastName", lastName
                        ))))
                .andExpect(status().is(expectedStatus));
    }

    @Test
    void registerSigninAndCallProtectedEndpointWithIssuedToken() throws Exception {
        register("jan@example.com", "secret123", "Jan", "Kowalski", 200);

        assertThat(userRepository.findByUsername("jan@example.com"))
                .get()
                .satisfies(u -> assertThat(passwordEncoder.matches("secret123", u.getPassword())).isTrue());

        String body = mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", "jan@example.com", "password", "secret123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("jan@example.com"))
                .andExpect(jsonPath("$.roles[0]").value("USER"))
                .andReturn().getResponse().getContentAsString();

        JsonNode json = objectMapper.readTree(body);
        String token = json.get("accessToken").asText();

        mockMvc.perform(get("/reservations/my-reservations")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void registerWithTakenEmail_isRejected() throws Exception {
        register("jan@example.com", "secret123", "Jan", "Kowalski", 200);
        register("jan@example.com", "other123", "Adam", "Mickiewicz", 400);

        assertThat(userRepository.count()).isEqualTo(1);
    }

    @Test
    void signinWithWrongPassword_returns401() throws Exception {
        createUser("jan@example.com", "secret123", "Jan", "Kowalski");

        mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", "jan@example.com", "password", "wrong"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Bad credentials"));
    }

    @Test
    void protectedEndpoint_withoutOrWithForgedToken_returns401() throws Exception {
        mockMvc.perform(get("/invoice"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/reservations/my-reservations")
                        .header("Authorization", "Bearer not-a-real-jwt"))
                .andExpect(status().isUnauthorized());
    }
}
