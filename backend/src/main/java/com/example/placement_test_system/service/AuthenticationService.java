package com.example.placement_test_system.service;

import com.example.placement_test_system.dto.AuthenticationRequest;
import com.example.placement_test_system.dto.AuthenticationResponse;
import com.example.placement_test_system.dto.RegisterRequest;
import com.example.placement_test_system.model.Role;
import com.example.placement_test_system.model.User;
import com.example.placement_test_system.repository.UserRepository;
import com.example.placement_test_system.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        if (!request.getEmail().endsWith("@gcee.ac.in")) {
            throw new IllegalArgumentException("Only @gcee.ac.in emails are allowed");
        }
        if (repository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already taken");
        }
        var user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_STUDENT) // Default registration is student
                .mustChangePassword(false) // Standard register doesn't require this
                .build();
        repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .mustChangePassword(user.isMustChangePassword())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .mustChangePassword(user.isMustChangePassword())
                .build();
    }
}
