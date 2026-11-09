package com.example.services_management_system;

import com.example.services_management_system.user.Role;
import com.example.services_management_system.user.User;
import com.example.services_management_system.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class ServicesManagementSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServicesManagementSystemApplication.class, args);
	}

	@Bean
    CommandLineRunner createAdmin(UserRepository userRepository,
                                  PasswordEncoder passwordEncoder,
                                  @Value("${app.admin.email:admin@example.com}") String adminEmail,
                                  @Value("${app.admin.password:admin123}") String adminPassword) {
		return args -> {
			if (userRepository.existsByUsername(adminEmail)) {
				return;
			}
			User admin = new User(adminEmail, passwordEncoder.encode(adminPassword), "Admin", "Admin");
			admin.setRole(Role.ADMIN);
			userRepository.save(admin);
		};
	}
}
