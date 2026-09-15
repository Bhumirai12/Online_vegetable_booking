package com.example.onlinevegetable.service;

import com.example.onlinevegetable.dto.PaymentRequest;
import com.example.onlinevegetable.dto.PaymentResponse;
import com.example.onlinevegetable.entity.Order;
import com.example.onlinevegetable.entity.Payment;
import com.example.onlinevegetable.entity.User;
import com.example.onlinevegetable.repository.OrderRepository;
import com.example.onlinevegetable.repository.PaymentRepository;
import com.example.onlinevegetable.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.onlinevegetable.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import com.example.onlinevegetable.dto.PaymentVerificationRequest;
import com.razorpay.Utils;
import java.util.List;
import java.time.LocalDateTime;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;

@Service
@Transactional
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    // CREATE PAYMENT
    public PaymentResponse createPayment(String email, PaymentRequest request) {

        // Get logged-in customer
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Get order
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        // Check order belongs to logged-in customer
        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Order does not belong to this user");
        }

        // Cancelled order cannot be paid
        if (order.getStatus().equals("CANCELLED")) {
            throw new BadRequestException("Cancelled order cannot be paid");
        }

        // Delivered order cannot be paid
        if (order.getStatus().equals("DELIVERED")) {
            throw new BadRequestException(
                    "Delivered order cannot be paid"
            );
        }

        // One order can have only one payment
        if (paymentRepository
                .findByOrderOrderId(order.getOrderId())
                .isPresent()) {

            throw new BadRequestException(
                    "Payment already exists for this order"
            );
        }

        // Validate payment method
        String paymentMethod = request.getPaymentMethod().toUpperCase();

        if (!paymentMethod.equals("COD")
                && !paymentMethod.equals("ONLINE")) {

            throw new BadRequestException("Invalid payment method");
        }

        // Create payment
        Payment payment = new Payment();

        payment.setOrder(order);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus("PENDING");

        // Amount always comes from order
        payment.setAmount(order.getTotalAmount());

        payment.setPaymentDate(LocalDateTime.now());

        // Create Razorpay order for online payment
        if (paymentMethod.equals("ONLINE")) {

            try {
                RazorpayClient razorpayClient =
                        new RazorpayClient(razorpayKeyId, razorpayKeySecret);

                JSONObject options = new JSONObject();

                // Razorpay accepts amount in paise
                int amountInPaise =
                        (int) Math.round(order.getTotalAmount() * 100);

                options.put("amount", amountInPaise);
                options.put("currency", "INR");

                com.razorpay.Order razorpayOrder =
                        razorpayClient.orders.create(options);

                payment.setRazorpayOrderId(
                        razorpayOrder.get("id")
                );

            } catch (RazorpayException e) {
                throw new RuntimeException(
                        "Unable to create Razorpay order"
                );
            }
        }

        // Save payment
        Payment savedPayment = paymentRepository.save(payment);

        // Create payment response
        PaymentResponse response = new PaymentResponse();

        response.setPaymentId(savedPayment.getPaymentId());
        response.setOrderId(savedPayment.getOrder().getOrderId());
        response.setPaymentMethod(savedPayment.getPaymentMethod());
        response.setPaymentStatus(savedPayment.getPaymentStatus());
        response.setAmount(savedPayment.getAmount());
        response.setRazorpayOrderId(savedPayment.getRazorpayOrderId());
        response.setRazorpayPaymentId(savedPayment.getRazorpayPaymentId());
        response.setPaymentDate(savedPayment.getPaymentDate());

        return response;
    }

    // VERIFY ONLINE PAYMENT
    public PaymentResponse verifyPayment(
            String email,
            PaymentVerificationRequest request) {

        // Get logged-in customer
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Find payment using Razorpay order id
        Payment payment = paymentRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() ->
                        new RuntimeException("Payment not found"));

        // Check payment belongs to logged-in customer
        if (!payment.getOrder().getUser().getUserId()
                .equals(user.getUserId())) {

            throw new RuntimeException(
                    "Payment does not belong to this user"
            );
        }

        // Only online payment can be verified
        if (!payment.getPaymentMethod().equals("ONLINE")) {
            throw new BadRequestException(
                    "Only online payment can be verified"
            );
        }

        // Paid payment cannot be verified again
        if (payment.getPaymentStatus().equals("PAID")) {
            throw new BadRequestException(
                    "Payment is already completed"
            );
        }

        // Verify Razorpay signature
        try {
            JSONObject attributes = new JSONObject();

            attributes.put(
                    "razorpay_order_id",
                    request.getRazorpayOrderId()
            );

            attributes.put(
                    "razorpay_payment_id",
                    request.getRazorpayPaymentId()
            );

            attributes.put(
                    "razorpay_signature",
                    request.getRazorpaySignature()
            );

            boolean validSignature =
                    Utils.verifyPaymentSignature(
                            attributes,
                            razorpayKeySecret
                    );

            if (!validSignature) {
                throw new BadRequestException(
                        "Payment verification failed"
                );
            }

        } catch (RazorpayException e) {
            throw new BadRequestException(
                    "Payment verification failed"
            );
        }

        // Update payment after successful verification
        payment.setPaymentStatus("PAID");
        payment.setRazorpayPaymentId(
                request.getRazorpayPaymentId()
        );

        Payment savedPayment =
                paymentRepository.save(payment);

        // Create response
        PaymentResponse response = new PaymentResponse();

        response.setPaymentId(savedPayment.getPaymentId());
        response.setOrderId(savedPayment.getOrder().getOrderId());
        response.setPaymentMethod(savedPayment.getPaymentMethod());
        response.setPaymentStatus(savedPayment.getPaymentStatus());
        response.setAmount(savedPayment.getAmount());
        response.setRazorpayOrderId(savedPayment.getRazorpayOrderId());
        response.setRazorpayPaymentId(savedPayment.getRazorpayPaymentId());
        response.setPaymentDate(savedPayment.getPaymentDate());

        return response;
    }

    // GET PAYMENT BY ORDER ID
    public PaymentResponse getPaymentByOrderId(
            String email,
            Long orderId) {

        // Get logged-in customer
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Get order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        // Check order belongs to logged-in customer
        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException(
                    "Order does not belong to this user"
            );
        }

        // Find payment by order id
        Payment payment = paymentRepository
                .findByOrderOrderId(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Payment not found"));

        // Create response
        PaymentResponse response = new PaymentResponse();

        response.setPaymentId(payment.getPaymentId());
        response.setOrderId(payment.getOrder().getOrderId());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setPaymentStatus(payment.getPaymentStatus());
        response.setAmount(payment.getAmount());
        response.setRazorpayOrderId(payment.getRazorpayOrderId());
        response.setRazorpayPaymentId(payment.getRazorpayPaymentId());
        response.setPaymentDate(payment.getPaymentDate());

        return response;
    }

    // ADMIN - GET ALL PAYMENTS
    public List<PaymentResponse> getAllPayments() {

        List<Payment> payments =
                paymentRepository.findAllByOrderByPaymentDateDesc();

        return payments.stream()
                .map(payment -> {

                    PaymentResponse response = new PaymentResponse();

                    response.setPaymentId(payment.getPaymentId());
                    response.setOrderId(payment.getOrder().getOrderId());
                    response.setPaymentMethod(payment.getPaymentMethod());
                    response.setPaymentStatus(payment.getPaymentStatus());
                    response.setAmount(payment.getAmount());
                    response.setRazorpayOrderId(payment.getRazorpayOrderId());
                    response.setRazorpayPaymentId(payment.getRazorpayPaymentId());
                    response.setPaymentDate(payment.getPaymentDate());

                    return response;
                })
                .collect(java.util.stream.Collectors.toList());
    }

}