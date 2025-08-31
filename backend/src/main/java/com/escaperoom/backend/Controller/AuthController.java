package com.escaperoom.backend.Controller;

import com.escaperoom.backend.Service.UserService;
import com.escaperoom.backend.models.User;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final UserService service;

    @Autowired
    public AuthController(UserService service) {
        this.service = service;
    }

    @PostMapping("/")
    public ResponseEntity<User> checkEmail(@Valid @RequestBody String email) {
        boolean exists = service.findByEmail(email);
        return ResponseEntity.ok()
                .header("Cache-Control", "no-store")
                .body(new User());
    }
}
