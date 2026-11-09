package com.example.services_management_system.user;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/add-provider/{email}")
    public void addProvider(@PathVariable String email) {
        userService.addProvider(email);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/remove-provider/{email}")
    public void removeProvider(@PathVariable String email) {
        userService.deleteProvider(email);
    }
}
