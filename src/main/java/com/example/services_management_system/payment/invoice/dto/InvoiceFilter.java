package com.example.services_management_system.payment.invoice.dto;

public class InvoiceFilter {
    private String email;
    private Boolean issued;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public Boolean getIssued() {
        return issued;
    }

    public void setIssued(Boolean issued) {
        this.issued = issued;
    }
}
