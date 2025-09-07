package com.escaperoom.backend.repo;

import com.escaperoom.backend.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepo extends JpaRepository<Question, Long> {
}
