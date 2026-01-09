package com.escaperoom.backend.service;

import com.escaperoom.backend.dto.QuestionRequest;
import com.escaperoom.backend.model.Question;
import com.escaperoom.backend.repo.QuestionRepo;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepo questionRepo;

    public QuestionService(QuestionRepo questionRepo) {
        this.questionRepo = questionRepo;
    }

    public List<Question> getAllQuestions() {
        return questionRepo.findAll();
    }


    public Question addQuestion(QuestionRequest request) {
        Question question = new Question();
        question.setQuestionText(request.getQuestionText());
        question.setDifficulty(request.getDifficulty());
        question.setHint(request.getHint());
        question.setAnswer(request.getAnswer());
        question.setOrderNumber(request.getOrderNumber());

        return questionRepo.save(question);
    }

    public Question getQuestionById(Long id) {
        return questionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
    }

    public boolean deleteQuestionById(Long id) {
        if(questionRepo.existsById(id)) {
            questionRepo.deleteById(id);
            return true;
        }
        return false;
    }

    public Question updateQuestion(Long id, @Valid QuestionRequest questionRequest) {
        return questionRepo.findById(id)
                .map(existing -> {
                    existing.setQuestionText(questionRequest.getQuestionText());
                    existing.setAnswer(questionRequest.getAnswer());
                    existing.setHint(questionRequest.getHint());
                    existing.setOrderNumber(questionRequest.getOrderNumber());
                    existing.setDifficulty(questionRequest.getDifficulty());
                    return questionRepo.save(existing);
                })
                .orElse(null);
    }
}
