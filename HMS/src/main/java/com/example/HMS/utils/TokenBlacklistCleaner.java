package com.example.HMS.utils;

import com.example.HMS.repository.TokenBlacklistRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
@RequiredArgsConstructor
public class TokenBlacklistCleaner {

    private final TokenBlacklistRepository tokenBlacklistRepository;

    @Scheduled(fixedRate = 86400000)
    @Transactional// chạy mỗi 24 giờ
    public void cleanBlacklist() {
        Date now = new Date();
        tokenBlacklistRepository.deleteByExpirationBefore(now);
    }
}
