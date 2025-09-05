package com.escaperoom.backend.controller;

import com.escaperoom.backend.dto.LoginRequest;
import com.escaperoom.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Boolean> authenticateUser(@RequestBody LoginRequest request) {
        boolean valid = userService.verifyCredentials(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(valid);
    }
}