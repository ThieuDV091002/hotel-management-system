package com.example.HMS.config;

import jakarta.annotation.PostConstruct;
import com.google.ortools.Loader;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OrToolsConfig {
    @PostConstruct
    public void init() {
        Loader.loadNativeLibraries();
    }
}
