package com.escaperoom.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LockValidationResponseDTO {
    private Boolean correct;
    private String message;
    private GameStateDTO updatedState; // if lock opened or state changed
}
