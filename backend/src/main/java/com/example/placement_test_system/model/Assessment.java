package com.example.placement_test_system.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private AssessmentType type;

    private int totalPoints;
    private int durationMinutes;

    @OneToMany(cascade = CascadeType.ALL)
    private List<Question> questions;
}