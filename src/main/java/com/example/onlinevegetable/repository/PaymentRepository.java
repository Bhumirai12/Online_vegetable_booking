package com.example.onlinevegetable.repository;

import com.example.onlinevegetable.entity.Order;
import com.example.onlinevegetable.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Find payment by order
    Optional<Payment> findByOrderOrderId(Long orderId);

    // Find payment by Razorpay order id
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    // Admin - all payments latest first
    List<Payment> findAllByOrderByPaymentDateDesc();
}