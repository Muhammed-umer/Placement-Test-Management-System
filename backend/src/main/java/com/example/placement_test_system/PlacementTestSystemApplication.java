package com.example.placement_test_system;

import com.example.placement_test_system.model.Role;
import com.example.placement_test_system.model.User;
import com.example.placement_test_system.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableAsync
public class PlacementTestSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(PlacementTestSystemApplication.class, args);
	}

	@Bean
	CommandLineRunner run(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (!userRepository.existsByEmail("superadmin@gcee.ac.in")) {
				User admin = User.builder()
						.email("superadmin@gcee.ac.in")
						.fullName("System Administrator")
						.password(passwordEncoder.encode("password"))
						.role(Role.ROLE_SUPER_ADMIN)
						.mustChangePassword(false)
						.build();
				userRepository.save(admin);
			}
		};
	}
}
