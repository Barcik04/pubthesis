package com.example.services_management_system.utils.email;

public interface EmailSender {
    void send(String to, String subject, String body);
}