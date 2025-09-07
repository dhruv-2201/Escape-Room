package com.escaperoom.backend.controller;

import com.escaperoom.backend.dto.CreateUserRequest;
import com.escaperoom.backend.dto.LoginRequest;
import com.escaperoom.backend.dto.UserResponse;
import com.escaperoom.backend.model.User;
import com.escaperoom.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Authentication", description = "Endpoints for user authentication")
public class AuthController {
    private final UserService userService;

    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @Operation(
            summary = "Authenticate user",
            description = "Validates user credentials and returns true if authentication succeeds, false otherwise"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Authentication result (true/false)",
            content = @Content(schema = @Schema(implementation = Boolean.class))
    )
    @PostMapping("/")
    public ResponseEntity<Boolean> authenticateUser(@RequestBody LoginRequest request) {
        boolean valid = userService.verifyCredentials(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(valid);
    }

    @PostMapping("/create-account")
    public ResponseEntity<UUID> createUser(@RequestBody CreateUserRequest request) {
        User newUser = userService.createUser(request.getEmail(), request.getPassword());
        return ResponseEntity.status(201).body(newUser.getId());
    }

    @GetMapping("/all-users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers().stream()
                .map(user -> new UserResponse(user.getId(), user.getEmail()))
                .toList();
        return ResponseEntity.ok(users);
    }

}