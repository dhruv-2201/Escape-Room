package com.escaperoom.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String questionText;

    @Column(nullable = false)
    private String answer;

    private String hint;

    @Column(nullable = false)
    private int orderNumber;

    @Enumerated(EnumType.STRING)   // Store enum as string (EASY, MEDIUM, HARD)
    @Column(nullable = false)
    private DifficultyLevel difficulty;
}
