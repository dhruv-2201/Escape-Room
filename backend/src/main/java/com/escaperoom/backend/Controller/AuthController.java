package com.escaperoom.backend.Controller;

import com.escaperoom.backend.Service.UserService;
import com.escaperoom.backend.models.User;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService service;

    @PostMapping("/")
    public ResponseEntity<Boolean> checkEmail(@Valid @RequestBody String email) {
        boolean exists = service.findByEmail(email);
        return ResponseEntity.ok()
                .header("Cache-Control", "no-store")
                .body(exists);
    }
}
