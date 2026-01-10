package com.escaperoom.backend.repo;

import com.escaperoom.backend.model.GameSession;
import com.escaperoom.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {
    Optional<GameSession> findByIdAndUser(Long id, User user);
    List<GameSession> findByUserOrderByLastUpdatedDesc(User user);
    Optional<GameSession> findFirstByUserOrderByLastUpdatedDesc(User user);
}
