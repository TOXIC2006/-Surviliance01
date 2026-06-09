package com.chat.app.chat.app.payload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String tokenType;
    private String username;
    private String userId;
    private String role;
    private String message;

    public static AuthResponse success(String token, String username, String userId, String role) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .username(username)
                .userId(userId)
                .role(role)
                .message("Authentication successful")
                .build();
    }
}
