package com.example.placement_test_system.service;

import com.example.placement_test_system.model.Role;
import com.example.placement_test_system.model.User;
import com.example.placement_test_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
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

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @jakarta.annotation.PostConstruct
    public void initSuperAdmin() {
        if (!userRepository.existsByEmail("superadmin@gcee.ac.in")) {
            User superAdmin = User.builder()
                    .email("superadmin@gcee.ac.in")
                    .fullName("Systems Super Admin")
                    .password(passwordEncoder.encode("superadmin123"))
                    .role(Role.ROLE_SUPER_ADMIN)
                    .mustChangePassword(false)
                    .build();
            userRepository.save(superAdmin);
        }
    }

    public void createAdmin(String email) {
        if (!email.endsWith("@gcee.ac.in")) {
            throw new RuntimeException("Admin email must end with @gcee.ac.in");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists.");
        }
        User admin = User.builder()
                .email(email)
                .fullName("System Administrator")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ROLE_ADMIN)
                .mustChangePassword(true)
                .build();
        userRepository.save(admin);
    }

    public void onboardStudentsFromExcel(MultipartFile file) {
        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            List<User> students = new ArrayList<>();
            int emailColIndex = -1;

            for (Row row : sheet) {
                // Header row processing
                if (row.getRowNum() == 0) {
                    for (int i = 0; i < row.getLastCellNum(); i++) {
                        Cell cell = row.getCell(i);
                        if (cell != null && cell.getCellType() == CellType.STRING) {
                            String headerValue = cell.getStringCellValue().trim().toLowerCase();
                            if (headerValue.contains("email") || headerValue.contains("mail")) {
                                emailColIndex = i;
                                break;
                            }
                        }
                    }
                    if (emailColIndex == -1) {
                        throw new RuntimeException("Could not find column containing 'email' in header row.");
                    }
                    continue;
                }

                if (emailColIndex != -1) {
                    Cell emailCell = row.getCell(emailColIndex);
                    if (emailCell != null) {
                        String email = "";
                        if (emailCell.getCellType() == CellType.STRING) {
                            email = emailCell.getStringCellValue().trim();
                        } else if (emailCell.getCellType() == CellType.NUMERIC) {
                            email = String.valueOf((long) emailCell.getNumericCellValue()).trim();
                        }
                        
                        if (!email.isEmpty() && !userRepository.existsByEmail(email)) {
                            User student = User.builder()
                                    .email(email)
                                    .password(passwordEncoder.encode("12345678"))
                                    .role(Role.ROLE_STUDENT)
                                    .mustChangePassword(true) // Must change on first login
                                    .build();
                            students.add(student);
                        }
                    }
                }
            }
            if (!students.isEmpty()) {
                userRepository.saveAll(students);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Excel file: " + e.getMessage());
        }
    }

    public List<User> getAllStudents() {
        return userRepository.findByRole(Role.ROLE_STUDENT);
    }

    public List<User> getAllAdmins() {
        return userRepository.findByRole(Role.ROLE_ADMIN);
    }
}
