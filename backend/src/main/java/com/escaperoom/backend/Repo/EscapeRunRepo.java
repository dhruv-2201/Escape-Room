package com.escaperoom.backend.repo;

import com.escaperoom.backend.model.DifficultyLevel;
import com.escaperoom.backend.model.EscapeRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EscapeRunRepo extends JpaRepository<EscapeRun, Long> {

    Optional<EscapeRun> findFirstByUserIdAndDifficultyOrderByFinishedAtDesc(UUID userId, DifficultyLevel difficulty);
}

