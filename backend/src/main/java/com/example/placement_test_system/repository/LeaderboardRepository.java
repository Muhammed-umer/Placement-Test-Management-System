package com.example.placement_test_system.repository;

import com.example.placement_test_system.model.LeaderboardEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaderboardRepository extends JpaRepository<LeaderboardEntry, Long> {
    List<LeaderboardEntry> findByAssessmentIdOrderByTotalPointsDescFinishTimeAsc(Long assessmentId);
    LeaderboardEntry findByAssessmentIdAndStudentEmail(Long assessmentId, String studentEmail);
    List<LeaderboardEntry> findByStudentEmail(String studentEmail);
}
