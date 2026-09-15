package com.example.onlinevegetable.config;

import com.example.onlinevegetable.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 401 - JWT missing/invalid
    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> {

            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json");

            response.getWriter().write(
                    "{\"message\":\"Authentication required\"}"
            );
        };
    }

    // 403 - JWT valid but role not allowed
    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {

            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType("application/json");

            String message;

            if (request.getMethod().equals("POST")
                    && request.getServletPath().startsWith("/api/vegetables")) {
                message = "You are not allowed to create vegetables";

            } else if (request.getMethod().equals("PUT")
                    && request.getServletPath().startsWith("/api/vegetables")) {
                message = "You are not allowed to update vegetables";

            } else if (request.getMethod().equals("DELETE")
                    && request.getServletPath().startsWith("/api/vegetables")) {
                message = "You are not allowed to delete vegetables";

            } else {

                message = "You are not allowed to access this resource";
            }
            response.getWriter().write(
                    "{\"message\":\"" + message + "\"}"
            );
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            AccessDeniedHandler accessDeniedHandler) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        // USER PUBLIC APIs
                        .requestMatchers(
                                "/api/users/register",
                                "/api/users/login",
                                "/api/users/forgot-password",
                                "/api/users/reset-password"
                        ).permitAll()

                        // CART - CUSTOMER ONLY
                        .requestMatchers(
                                "/api/cart",
                                "/api/cart/**"
                        ).hasRole("CUSTOMER")

                        //ORDER - CUSTOMER CAN PLACE ORDER
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/orders"
                        ).hasRole("CUSTOMER")

                        // ADMIN CAN VIEW ALL ORDERS
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/admin/all"
                        ).hasRole("ADMIN")

                        // ADMIN CAN VIEW SINGLE ORDER
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/admin/*"
                        ).hasRole("ADMIN")

                        // ADMIN CAN UPDATE ORDER STATUS
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/orders/admin/*/status"
                        ).hasRole("ADMIN")

                        // CUSTOMER CAN CANCEL OWN ORDER
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/orders/*/cancel"
                        ).hasRole("CUSTOMER")

                        //CUSTOMER CAN VIEW OWN ORDERS
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders",
                                "/api/orders/**"
                        ).hasRole("CUSTOMER")

                        // VEGETABLE - CUSTOMER + ADMIN
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/vegetables",
                                "/api/vegetables/**"
                        ).hasAnyRole("CUSTOMER", "ADMIN")

                        // VEGETABLE - ADMIN ONLY
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/vegetables"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/vegetables/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/vegetables/**"
                        ).hasRole("ADMIN")

                        // CATEGORY - CUSTOMER + ADMIN
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/categories",
                                "/api/categories/**"
                        ).hasAnyRole("CUSTOMER", "ADMIN")

                        // CATEGORY - ADMIN ONLY
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/categories"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/categories/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/categories/**"
                        ).hasRole("ADMIN")

                        // PAYMENT
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/payments",
                                "/api/payments/verify"
                        ).hasRole("CUSTOMER")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/payments/order/*"
                        ).hasRole("CUSTOMER")

                        //ADMIN PAYMENT
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/payments/admin/**"
                        ).hasRole("ADMIN")

                        // OTHER APIs
                        .anyRequest().authenticated()
                )

                .exceptionHandling(exception -> exception
                        .accessDeniedHandler(accessDeniedHandler)
                        .authenticationEntryPoint(authenticationEntryPoint())
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}