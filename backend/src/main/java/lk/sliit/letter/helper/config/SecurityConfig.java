package lk.sliit.letter.helper.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        // Admin page (SinhalaAdmin.js) doesn't send a JWT token on
                        // create/edit/delete/audio-upload calls, so all /sentences/**
                        // methods (GET, POST, PUT, DELETE) need to stay open for now.
                        .requestMatchers("/sentences/**").permitAll()

                        // ── Gamified Learning — game sessions, reactions, achievements ──
                        .requestMatchers("/api/gamified/**").permitAll()        // ← NEW
                        .requestMatchers("/api/game-progress/**").permitAll()   // ← NEW
                        .requestMatchers("/api/games/**").permitAll()           // ← NEW
                        .requestMatchers("/api/letters/**").permitAll()         // ← NEW
                        .requestMatchers("/api/achievements/**").permitAll()    // ← NEW
                        .requestMatchers("/api/dashboard/**").permitAll()       // ← NEW
                        .requestMatchers("/api/recognition/**").permitAll()     // ← NEW
                        .requestMatchers("/api/letter-tracing/**").permitAll()  // ← NEW
                        .requestMatchers("/api/students/**").permitAll()        // ← NEW
                        .requestMatchers("/api/game-data/**").permitAll()  // ← ADD

                        // ── Static uploaded files (word images etc.) — served by
                        // WebConfig's resource handler, must not require a JWT ──
                        .requestMatchers("/uploads/**").permitAll()        // ← ADD

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*")); // restrict in production
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}