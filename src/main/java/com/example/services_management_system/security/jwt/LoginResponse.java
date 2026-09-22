package com.example.services_management_system.security.jwt;


import java.util.List;

public class LoginResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String email;
    private List<String> roles;

    public LoginResponse(String accessToken, String email, List<String> roles) {
        this.accessToken = accessToken;
        this.email = email;
        this.roles = roles;
    }

    public String getAccessToken() { return accessToken; }
    public String getTokenType() { return tokenType; }

    public String getEmail() {
        return email;
    }

    public List<String> getRoles() { return roles; }
}



