package com.escaperoom.backend.service;

import com.escaperoom.backend.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class UserService {
    @Autowired
    private UserRepo repo;
    private PasswordEncoder passwordEncoder;

    public boolean verifyCredentials(String email, String rawPassword) {
        return repo.findByEmail(email)
                .map(user -> passwordEncoder.matches(rawPassword, user.getPassword()))
                .orElse(false);
    }
}