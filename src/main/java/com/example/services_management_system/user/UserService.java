package com.example.services_management_system.user;


import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public void addProvider(String email) {
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new NoSuchElementException("no user found"));

        user.setRole(Role.PROVIDER);
    }

    @Transactional
    public void deleteProvider(String email) {
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new NoSuchElementException("no user found"));

        user.setRole(Role.USER);
    }
}
