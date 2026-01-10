package com.escaperoom.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StartGameSessionRequestDTO {
    private UUID userId;
    private String difficulty; // optional, for future use
}
