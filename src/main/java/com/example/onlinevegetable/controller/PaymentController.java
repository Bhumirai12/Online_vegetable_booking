package com.example.onlinevegetable.controller;

import com.example.onlinevegetable.dto.PaymentRequest;
import com.example.onlinevegetable.dto.PaymentResponse;
import com.example.onlinevegetable.dto.PaymentVerificationRequest;
import com.example.onlinevegetable.entity.User;
import com.example.onlinevegetable.service.PaymentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // CREATE PAYMENT
    @PostMapping
    public PaymentResponse createPayment(
            Authentication authentication,
            @Valid @RequestBody PaymentRequest request) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        return paymentService.createPayment(email, request);
    }

    // VERIFY ONLINE PAYMENT
    @PostMapping("/verify")
    public PaymentResponse verifyPayment(
            Authentication authentication,
            @Valid @RequestBody PaymentVerificationRequest request) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        return paymentService.verifyPayment(email, request);
    }

    // GET PAYMENT BY ORDER ID
    @GetMapping("/order/{orderId}")
    public PaymentResponse getPaymentByOrderId(
            Authentication authentication,
            @PathVariable Long orderId) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        return paymentService.getPaymentByOrderId(
                email,
                orderId
        );
    }

    // ADMIN - GET ALL PAYMENTS
    @GetMapping("/admin/all")
    public List<PaymentResponse> getAllPayments() {

        return paymentService.getAllPayments();
    }
}
