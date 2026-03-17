package com.example.placement_test_system.service;

import com.example.placement_test_system.model.Role;
import com.example.placement_test_system.model.User;
import com.example.placement_test_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void onboardStudentsFromExcel(MultipartFile file) {
        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            List<User> students = new ArrayList<>();
            for (Row row : sheet) {
                // Skip header
                if (row.getRowNum() == 0) continue;

                // Assuming Column 0 is Email
                if (row.getCell(0) != null) {
                    String email = row.getCell(0).getStringCellValue();
                    if (email.endsWith("@gcee.ac.in") && !userRepository.existsByEmail(email)) {
                        String autoPassword = UUID.randomUUID().toString().substring(0, 8); // Auto-generate
                        User student = User.builder()
                                .email(email)
                                .password(passwordEncoder.encode(autoPassword))
                                .role(Role.ROLE_STUDENT)
                                .mustChangePassword(true) // Must change on first login
                                .build();
                        students.add(student);
                        // In a real scenario, you'd send this autoPassword to the user's email here
                    }
                }
            }
            userRepository.saveAll(students);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Excel file: " + e.getMessage());
        }
    }
}
