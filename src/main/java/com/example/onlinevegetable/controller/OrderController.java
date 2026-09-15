package com.example.onlinevegetable.controller;

import com.example.onlinevegetable.entity.User;
import com.example.onlinevegetable.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.example.onlinevegetable.dto.OrderResponse;
import com.example.onlinevegetable.dto.OrderRequest;
import jakarta.validation.Valid;
import java.util.List;
import com.example.onlinevegetable.dto.OrderStatusRequest;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    // PLACE ORDER
    @PostMapping
    public ResponseEntity<String> placeOrder(
            Authentication authentication,
            @Valid @RequestBody OrderRequest request) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        orderService.placeOrder(email, request);

        return ResponseEntity.ok(
                "Order placed successfully"
        );
    }

    // GET CUSTOMER ORDER HISTORY
    @GetMapping
    public List<OrderResponse> getOrders(
            Authentication authentication) {

        // Get logged-in customer
        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        return orderService.getOrdersByEmail(email);
    }

    // GET SINGLE CUSTOMER ORDER
    @GetMapping("/{orderId}")
    public OrderResponse getOrderById(
            Authentication authentication,
            @PathVariable Long orderId) {

        // Get logged-in customer
        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        return orderService.getOrderById(email, orderId);
    }

    // ADMIN - GET ALL ORDERS
    @GetMapping("/admin/all")
    public List<OrderResponse> getAllOrders() {

        return orderService.getAllOrders();
    }

    // ADMIN - GET SINGLE ORDER
    @GetMapping("/admin/{orderId}")
    public OrderResponse getOrderByIdForAdmin(
            @PathVariable Long orderId) {

        return orderService.getOrderByIdForAdmin(orderId);
    }

    // ADMIN - UPDATE ORDER STATUS
    @PutMapping("/admin/{orderId}/status")
    public ResponseEntity<String> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusRequest request) {

        orderService.updateOrderStatus(
                orderId,
                request.getStatus()
        );

        return ResponseEntity.ok(
                "Order status updated successfully"
        );
    }



    // CUSTOMER - CANCEL OWN ORDER
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<String> cancelOrder(
            Authentication authentication,
            @PathVariable Long orderId) {

        // Get logged-in customer
        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        orderService.cancelOrder(email, orderId);

        return ResponseEntity.ok(
                "Order cancelled successfully"
        );
    }
}
