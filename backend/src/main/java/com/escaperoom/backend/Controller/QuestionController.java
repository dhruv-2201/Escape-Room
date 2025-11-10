package com.escaperoom.backend.controller;

import com.escaperoom.backend.dto.QuestionRequest;
import com.escaperoom.backend.model.Question;
import com.escaperoom.backend.service.QuestionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/question")
@Tag(name = "Questions", description = "Endpoints for CRUD on Questions")
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

    @PutMapping("/{id}")
    public ResponseEntity<Question> updateQuestionById(@PathVariable Long id, @Valid @RequestBody QuestionRequest questionRequest) {
        Question question = questionService.updateQuestion(id, questionRequest);
        if(question != null) return ResponseEntity.ok(question);
        else return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteQuestion(@PathVariable Long id) {
        boolean deleted = questionService.deleteQuestionById(id);
        if(deleted) {
            return ResponseEntity.ok("Question deleted Successfully.");
        }
        else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Question Not Found.");
        }
    }

}
