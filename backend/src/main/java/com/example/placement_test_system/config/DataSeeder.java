package com.example.placement_test_system.config;

import com.example.placement_test_system.model.Role;
import com.example.placement_test_system.model.User;
import com.example.placement_test_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@gcee.ac.in")) {
            User admin = User.builder()
                    .email("admin@gcee.ac.in")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ROLE_ADMIN)
                    .mustChangePassword(false)
                    .build();
            userRepository.save(admin);
            System.out.println("Default Admin account created: admin@gcee.ac.in / Admin@123");
        }
        
        if (!userRepository.existsByEmail("student@gcee.ac.in")) {
            User student = User.builder()
                    .email("student@gcee.ac.in")                     
                    .password(passwordEncoder.encode("Student@123"))
                    .role(Role.ROLE_STUDENT)
                    .mustChangePassword(false)
                    .build();
            userRepository.save(student);
            System.out.println("Default Student account created: student@gcee.ac.in / Student@123");
        }
    }
}
