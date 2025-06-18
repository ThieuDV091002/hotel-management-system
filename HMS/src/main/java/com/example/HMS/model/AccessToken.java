package com.example.HMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "access_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccessToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "request_id", nullable = false)
    private Long requestId;

    @Column(name = "request_type", nullable = false)
    private String requestType;

    @Column(name = "guest_email", nullable = false)
    private String guestEmail;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
}
