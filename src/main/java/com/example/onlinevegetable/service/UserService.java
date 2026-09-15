package com.example.onlinevegetable.service;

import com.example.onlinevegetable.security.JwtUtil;
import com.example.onlinevegetable.dto.RegisterRequest;
import com.example.onlinevegetable.dto.UpdateProfileRequest;
import com.example.onlinevegetable.dto.UserResponse;
import com.example.onlinevegetable.entity.User;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.onlinevegetable.exception.UserNotFoundException;
import com.example.onlinevegetable.repository.UserRepository;
import com.example.onlinevegetable.exception.InvalidCredentialsException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import com.example.onlinevegetable.exception.BadRequestException;
import com.example.onlinevegetable.exception.DuplicateEmailException;


@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    // REGISTER
    public UserResponse saveUser(RegisterRequest request) {
        User existingUser = userRepository.findByEmail(request.getEmail());

        if (existingUser != null) {
            throw new DuplicateEmailException("Email already registered");
            }

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setPhone(request.getPhone());
        User savedUser = userRepository.save(user);

        return convertToDTO(savedUser);
    }

    // LOGIN
    public UserResponse loginUser(String email, String password) {

        User user = userRepository.findByEmail(email);
        if (user != null &&
                passwordEncoder.matches(password, user.getPassword())) {
            String token = jwtUtil.generateToken(
                    user.getEmail()
            );
            UserResponse response = convertToDTO(user);
            response.setToken(token);
            return response;
        }
        throw new InvalidCredentialsException("Invalid email or password");
    }

    public Long getLoggedInUserId() {

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return user.getUserId();
    }

    // GET USER BY ID
    public UserResponse getUserById(Long userId) {
        Long loggedInUserId = getLoggedInUserId();
        if (!loggedInUserId.equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User Not Found"));

        return convertToDTO(user);
    }

    // UPDATE USER
    public UserResponse updateUser(
            Long userId,
            UpdateProfileRequest request) {

        Long loggedInUserId = getLoggedInUserId();

        if (!loggedInUserId.equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        User existingUser = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User Not Found"));

        if (request.getFullName() != null) {
            existingUser.setFullName(
                    request.getFullName()
            );
        }

        if (request.getPhone() != null) {
            existingUser.setPhone(
                    request.getPhone()
            );
        }

        if (request.getPassword() != null) {
            existingUser.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );
        }

        User updatedUser = userRepository.save(existingUser);
        return convertToDTO(updatedUser);
    }

    // DELETE USER
    public void deleteUser(Long userId) {
        Long loggedInUserId = getLoggedInUserId();

        if (!loggedInUserId.equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        User existingUser = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User Not Found"));

        userRepository.delete(existingUser);
    }

    // ENTITY TO DTO
    private UserResponse convertToDTO(User user) {

        UserResponse response = new UserResponse();

        response.setUserId(user.getUserId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());

        return response;
    }

    //forgot password
    public void forgotPassword(String email) {

        User user = userRepository.findByEmail(email);
                if(user == null){
                    throw new UserNotFoundException("User not found");
                }

        String otp = String.format("%06d",
                new java.util.Random().nextInt(1000000));

        user.setResetOtp(otp);
        user.setResetOtpExpiry(
                LocalDateTime.now().plusMinutes(10)
        );

        userRepository.save(user);
        emailService.sendOtpEmail(email, otp);
    }

    public void resetPassword( String otp, String newPassword) {

        User user = userRepository.findByResetOtp(otp);

        if (user == null) {
            throw new BadRequestException("Invalid OTP");
        }

        if (user.getResetOtpExpiry() == null ||
                user.getResetOtpExpiry().isBefore(LocalDateTime.now())) {

            throw new BadRequestException("OTP has expired");
        }

        user.setPassword(
                passwordEncoder.encode(newPassword)
        );
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);

        userRepository.save(user);
    }
}