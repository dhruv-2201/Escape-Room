package com.escaperoom.backend.service;

import com.escaperoom.backend.model.User;
import com.escaperoom.backend.repo.UserRepo;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class UserService {
    private final UserRepo repo;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepo repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean verifyCredentials(String email, String rawPassword) {
        return repo.findByEmail(email)
                .map(user -> passwordEncoder.matches(rawPassword, user.getPassword()))
                .orElse(false);
    }

    public User createUser(@Email @NotBlank String email, @NotBlank String password) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        return repo.save(user);
    }

    public List<User> getAllUsers() {
        return repo.findAll();
    }
}
