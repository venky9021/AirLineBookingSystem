package com.aeroflow.service;

import com.aeroflow.dto.AuthResponse;
import com.aeroflow.dto.LoginRequest;
import com.aeroflow.dto.RegisterRequest;
import com.aeroflow.entity.User;
import com.aeroflow.exception.InvalidBookingException;
import com.aeroflow.exception.ResourceNotFoundException;
import com.aeroflow.repository.UserRepository;
import com.aeroflow.security.CustomUserDetails;
import com.aeroflow.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new InvalidBookingException("Email is already registered!");
        }

        // Default role is USER, unless email is admin@aeroflow.com
        String role = "USER";
        if ("admin@aeroflow.com".equalsIgnoreCase(request.getEmail())) {
            role = "ADMIN";
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role)
                .build();

        user = userRepository.save(user);
        String token = jwtUtils.generateToken(user.getEmail());

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        String token = jwtUtils.generateToken(user.getEmail());

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getRole());
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new InvalidBookingException("User is not authenticated");
        }
        
        String email;
        if (authentication.getPrincipal() instanceof CustomUserDetails) {
            email = ((CustomUserDetails) authentication.getPrincipal()).getUsername();
        } else {
            email = authentication.getName();
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));
    }
}
