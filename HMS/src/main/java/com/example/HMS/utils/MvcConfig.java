package com.example.HMS.utils;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/room-photos/**")
                .addResourceLocations("file:C:/Users/Dao Van Thieu/OneDrive/Desktop/HMS/HMS/room-photos/");
    }

}
