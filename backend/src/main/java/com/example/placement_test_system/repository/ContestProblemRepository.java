package com.example.placement_test_system.repository;

import com.example.placement_test_system.model.ContestProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContestProblemRepository extends JpaRepository<ContestProblem, Long> {
    Optional<ContestProblem> findByContentHash(String contentHash);
    List<ContestProblem> findByTopicAndDifficultyAndIsActive(String topic, String difficulty, boolean isActive);
    List<ContestProblem> findByTopicAndIsActive(String topic, boolean isActive);
    List<ContestProblem> findByProblemTypeAndIsActive(ContestProblem.ProblemType problemType, boolean isActive);
    boolean existsByContentHash(String contentHash);
    long countByTopicAndDifficultyAndIsActive(String topic, String difficulty, boolean isActive);
    long countByTopicAndIsActive(String topic, boolean isActive);
}