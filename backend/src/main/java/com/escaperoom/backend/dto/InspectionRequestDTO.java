package com.escaperoom.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InspectionRequestDTO {
    private Long gameSessionId;
    private String stage; // "CELL", "DESK"
    private String inspectionArea; // optional: "drawer", "desk", etc.
}
