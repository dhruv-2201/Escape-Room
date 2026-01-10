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
public class InspectionResponseDTO {
    private String inspectionText;
    private GameStateDTO updatedState; // if inspection changed state
}
