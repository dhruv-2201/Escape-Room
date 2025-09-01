package com.escaperoom.backend.Controller;

import com.escaperoom.backend.Service.UserService;
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
    public ResponseEntity<Boolean> authenticateUser(@RequestBody String email) {
        boolean userExists = userService.findByEmail(email);
        return ResponseEntity.ok(userExists);
    }
}