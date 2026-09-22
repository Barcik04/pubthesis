package com.example.services_management_system.product.reservation.dto;

public class ReservationFilter {
    private String username;
    private Integer durationMinutes;
    private String offerName;
    private String firstName;
    private String lastName;

    public String getUsername() {
        return username;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public String getOfferName() {
        return offerName;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public void setOfferName(String offerName) {
        this.offerName = offerName;
    }
}
