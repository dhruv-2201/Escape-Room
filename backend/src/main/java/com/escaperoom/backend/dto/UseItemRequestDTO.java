package com.escaperoom.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UseItemRequestDTO {
    private Long gameSessionId;
    private String item; // "rod", "deskKey", "metalPiece"
    private String target; // optional: "drawer", "door", etc.
}
