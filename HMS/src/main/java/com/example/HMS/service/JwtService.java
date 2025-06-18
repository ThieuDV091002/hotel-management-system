package com.example.HMS.service;

import com.example.HMS.dto.TokenPair;
import com.example.HMS.model.TokenBlacklist;
import com.example.HMS.repository.TokenBlacklistRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpirationMs;

    private final TokenBlacklistRepository tokenBlacklistRepository;

    public JwtService(TokenBlacklistRepository tokenBlacklistRepository) {
        this.tokenBlacklistRepository = tokenBlacklistRepository;
    }

    public TokenPair generateTokenPair(Authentication authentication) {
        String accessToken = generateAccessToken(authentication);
        String refreshToken = generateRefreshToken(authentication);

        return new TokenPair(accessToken, refreshToken);
    }

    // Generate access token
    public String generateAccessToken(Authentication authentication) {
        return generateToken(authentication, jwtExpirationMs, new HashMap<>());
    }

    // Generate refresh token
    public String generateRefreshToken(Authentication authentication) {
        Map<String, String> claims = new HashMap<>();
        claims.put("tokenType", "refresh");
        return generateToken(authentication, refreshExpirationMs, claims);
    }

    private String generateToken(Authentication authentication, long expirationInMs, Map<String, String> claims) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        Date now = new Date(); // Time of token creation
        Date expiryDate = new Date(now.getTime() + expirationInMs); // Time of token expiration

        return Jwts.builder()
                .header()
                .add("typ", "JWT")
                .and()
                .subject(userPrincipal.getUsername())
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSignInKey())
                .compact();
    }

    // Validate token
    public boolean validateTokenForUser(String token, UserDetails userDetails) {
        final String username = extractUsernameFromToken(token);
        return username != null
                && username.equals(userDetails.getUsername())
                && userDetails.isEnabled();
    }

    public boolean isValidToken(String token) {
        // Kiểm tra token trong blacklist trước
        if (tokenBlacklistRepository.existsByToken(token)) {
            return false;
        }
        return extractAllClaims(token) != null;
    }

    public String extractUsernameFromToken(String token) {
        Claims claims = extractAllClaims(token);

        if(claims != null) {
            return claims.getSubject();
        }
        return null;
    }

    // Validate if the token is refresh token
    public boolean isRefreshToken(String token) {
        Claims claims = extractAllClaims(token);
        if(claims == null) {
            return false;
        }
        return "refresh".equals(claims.get("tokenType"));
    }

    public void blacklistToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            if (claims != null && claims.getExpiration() != null) {
                TokenBlacklist blacklistEntry = TokenBlacklist.builder()
                        .token(token)
                        .expiration(claims.getExpiration())
                        .build();
                tokenBlacklistRepository.save(blacklistEntry);
            }
        } catch (Exception e) {
            log.error("Failed to blacklist token", e);
        }
    }

    private Claims extractAllClaims(String token) {
        Claims claims = null;

        try {
            claims = Jwts.parser()
                    .verifyWith(getSignInKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new RuntimeException(e);
        }

        return claims;
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
