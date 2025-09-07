package com.escaperoom.backend.controller;

import com.escaperoom.backend.dto.QuestionRequest;
import com.escaperoom.backend.model.Question;
import com.escaperoom.backend.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/question")

public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping("/questions")
    public ResponseEntity<List<Question>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }

    @PostMapping("/add-question")
    public ResponseEntity<Long> addQuestion(@Valid @RequestBody QuestionRequest questionRequest) {
        Question question = questionService.addQuestion(questionRequest);
        return ResponseEntity.status(201).body(question.getId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Long id) {
        Question question = questionService.getQuestionById(id);
        return ResponseEntity.ok(question);
    }

}
