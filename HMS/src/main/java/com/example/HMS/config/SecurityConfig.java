package com.example.HMS.config;

import com.example.HMS.filter.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(
                        req -> req
                                .requestMatchers("/api/auth/**").permitAll()
                                .requestMatchers("/api/data/**").permitAll()
                                .requestMatchers(HttpMethod.GET).permitAll()
                                .requestMatchers("/api/admin/housekeeping-requests/**").hasAnyAuthority("ADMIN", "HOUSEKEEPING")
                                .requestMatchers(HttpMethod.GET, "/api/feedback/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/rooms/**").permitAll()
                                .requestMatchers(HttpMethod.PUT,"/api/rooms/**").hasAnyAuthority("ADMIN", "RECEPTIONIST", "HOUSEKEEPING")
                                .requestMatchers(HttpMethod.POST,"/api/rooms/**").hasAnyAuthority("ADMIN", "RECEPTIONIST")
                                .requestMatchers(HttpMethod.DELETE,"/api/rooms/**").hasAnyAuthority("ADMIN", "RECEPTIONIST")
                                .requestMatchers(HttpMethod.GET, "/api/services").permitAll()
                                .requestMatchers("/api/admin/service-requests/**").hasAnyAuthority("ADMIN", "POS_SERVICE")
                                .requestMatchers("/api/folios/**", "/api/guests/**").hasAnyAuthority("ADMIN", "RECEPTIONIST")
                                .requestMatchers("api/customers/forgot-password", "api/customers/reset-password").permitAll()
                                .requestMatchers("/api/amenities/**", "/api/amenity-history/**", "/api/assets/**", "/api/inventories/**",
                                        "/api/inventory-receipts/**", "/api/expenses/**",
                                        "/api/audit-reports/**", "/api/suppliers/**", "/api/housekeeping/**",
                                        "/api/services/**", "/api/maintenance-schedules/**").hasAuthority("ADMIN")
                                .requestMatchers("/api/housekeeping-requests/**", "/api/service-requests/**").permitAll()
                                .requestMatchers(HttpMethod.DELETE, "/api/housekeeping/schedules/**").hasAuthority("ADMIN")
                                .requestMatchers(HttpMethod.POST, "/api/bookings").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/bookings/customer/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/follios/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/bookings/admin/**").hasAnyAuthority("RECEPTIONIST", "ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/bookings/**").hasAnyAuthority("CUSTOMER", "RECEPTIONIST", "ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/bookings/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/bookings/**").permitAll()
                                .requestMatchers(HttpMethod.DELETE, "/api/bookings/**").hasAnyAuthority("RECEPTIONIST", "ADMIN")
                                .requestMatchers("/api/customers/profile").hasAuthority("CUSTOMER")
                                .requestMatchers("/api/customers/change-password").hasAuthority("CUSTOMER")
                                .requestMatchers(HttpMethod.GET, "/api/customers/**").hasAuthority("ADMIN")
                                .requestMatchers(HttpMethod.PATCH, "/api/customers/**").hasAuthority("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/customers/**").hasAuthority("ADMIN")
                                .requestMatchers(HttpMethod.POST, "/api/feedback/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/feedback/my-feedback").hasAuthority("CUSTOMER")
                                .requestMatchers(HttpMethod.PUT, "/api/feedback/**").permitAll()
                                .requestMatchers(HttpMethod.DELETE, "/api/feedback/**").permitAll()
                                .requestMatchers("/api/payments/**").permitAll()
                                .anyRequest().authenticated()
                )
                .sessionManagement(
                        session -> session
                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                ).addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authenticationProvider(authenticationProvider());
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:5173");
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedMethod("GET");
        configuration.addAllowedMethod("POST");
        configuration.addAllowedMethod("PUT");
        configuration.addAllowedMethod("PATCH");
        configuration.addAllowedMethod("DELETE");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
