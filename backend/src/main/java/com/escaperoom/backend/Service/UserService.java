package com.escaperoom.backend.Service;

import com.escaperoom.backend.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepo repo;

    @Autowired
    public UserService(UserRepo repo) {
        this.repo = repo;
    }

    public boolean findByEmail(String email) {
        return repo.findByEmail(email);
    }
}