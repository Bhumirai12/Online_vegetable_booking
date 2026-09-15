package com.example.onlinevegetable.controller;

import com.example.onlinevegetable.dto.LoginRequest;
import com.example.onlinevegetable.dto.RegisterRequest;
import com.example.onlinevegetable.dto.UpdateProfileRequest;
import com.example.onlinevegetable.dto.UserResponse;
import com.example.onlinevegetable.service.UserService;
import com.example.onlinevegetable.dto.ResetPasswordRequest;
import com.example.onlinevegetable.dto.ForgotPasswordRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Register API
    @PostMapping("/register")
    public UserResponse registerUser
    (@Valid @RequestBody RegisterRequest request) {
        return userService.saveUser(request);

    }

    // Login API
    @PostMapping("/login")
    public UserResponse loginUser(
            @Valid @RequestBody LoginRequest loginRequest) {
        return userService.loginUser(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );
    }

    // View Profile API
    @GetMapping("/{userId}")
    public UserResponse getUserById(@PathVariable Long userId) {
        return userService.getUserById(userId);

    }

    // Update Profile API
    @PutMapping("/{userId}")
    public UserResponse updateUser(
            @PathVariable Long userId,
            @RequestBody UpdateProfileRequest request) {
        return userService.updateUser(userId, request);

    }

    // Delete User API
    @DeleteMapping("/{userId}")
    public String deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return "User deleted successfully";

    }

    //rest password
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        userService.resetPassword(
                request.getOtp(),
                request.getNewPassword()
        );

        return ResponseEntity.ok("Password reset successfully");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        userService.forgotPassword(request.getEmail());

        return ResponseEntity.ok(
                "OTP sent successfully to your email"
        );
    }

}