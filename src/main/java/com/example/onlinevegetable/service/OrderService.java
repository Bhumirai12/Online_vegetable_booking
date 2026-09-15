package com.example.onlinevegetable.service;

import com.example.onlinevegetable.dto.OrderItemResponse;
import com.example.onlinevegetable.dto.OrderResponse;
import com.example.onlinevegetable.entity.*;
import com.example.onlinevegetable.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.onlinevegetable.dto.OrderRequest;
import com.example.onlinevegetable.exception.BadRequestException;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class OrderService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    // PLACE / CREATE ORDER
    public void placeOrder(String email, OrderRequest request) {

        // Get logged-in customer
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Get customer's cart
        Cart cart = cartRepository
                .findByUserUserId(user.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));

        // Get all cart items
        List<CartItem> cartItems =
                cartItemRepository.findByCart(cart);

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Check stock and calculate total amount
        double totalAmount = 0;

        for (CartItem cartItem : cartItems) {

            Vegetable vegetable = cartItem.getVegetable();

            if (cartItem.getQuantity() > vegetable.getStock()) {
                throw new BadRequestException(
                        vegetable.getName()
                                + " does not have enough stock"
                );
            }

            totalAmount +=
                    vegetable.getPrice()
                            * cartItem.getQuantity();
        }

        // Create main order
        Order order = new Order();

        order.setUser(user);
        order.setTotalAmount(totalAmount);
        order.setStatus("PLACED");
        order.setOrderDate(LocalDateTime.now());

        orderRepository.save(order);

        // Save delivery details
        order.setDeliveryAddress(
                request.getDeliveryAddress()
        );

        order.setCity(
                request.getCity()
        );

        order.setState(
                request.getState()
        );

        order.setPincode(
                request.getPincode()
        );

        order.setPhoneNumber(
                request.getPhoneNumber()
        );

        // Create order items and update stock
        for (CartItem cartItem : cartItems) {

            Vegetable vegetable = cartItem.getVegetable();

            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(order);
            orderItem.setVegetable(vegetable);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(vegetable.getPrice());

            orderItemRepository.save(orderItem);

            vegetable.setStock(
                    vegetable.getStock()
                            - cartItem.getQuantity()
            );
        }

        // Clear cart after successful order
        cartItemRepository.deleteAll(cartItems);
    }

    // GET CUSTOMER ORDER HISTORY
    public List<OrderResponse> getOrdersByEmail(String email) {

        // Find logged-in customer
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Fetch customer's latest orders first
        List<Order> orders =
                orderRepository
                        .findByUserUserIdOrderByOrderDateDesc(
                                user.getUserId()
                        );

        return orders.stream()
                .map(this::convertToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    // GET SINGLE CUSTOMER ORDER
    public OrderResponse getOrderById(
            String email,
            Long orderId) {

        // Find logged-in customer
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Find order
        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        // Check order ownership
        if (!order.getUser().getUserId()
                .equals(user.getUserId())) {

            throw new RuntimeException(
                    "Order does not belong to this user"
            );
        }

        return convertToResponse(order);
    }

    // GET ALL ORDERS FOR ADMIN
    public List<OrderResponse> getAllOrders() {

        // Fetch all orders - latest first
        List<Order> orders =
                orderRepository.findAllByOrderByOrderDateDesc();

        return orders.stream()
                .map(this::convertToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    // ADMIN - GET SINGLE ORDER
    public OrderResponse getOrderByIdForAdmin(Long orderId) {

        // Find order
        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        return convertToResponse(order);
    }

    // ADMIN - UPDATE ORDER STATUS
    public void updateOrderStatus(
            Long orderId,
            String status) {

        // Find order
        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        String currentStatus = order.getStatus();

        // PLACED can move to CONFIRMED or CANCELLED
        if (currentStatus.equals("PLACED")) {

            if (!status.equals("CONFIRMED")
                    && !status.equals("CANCELLED")) {

                throw new BadRequestException(
                        "Invalid order status change"
                );
            }

            // CONFIRMED can move to DELIVERED or CANCELLED
        } else if (currentStatus.equals("CONFIRMED")) {

            if (!status.equals("DELIVERED")
                    && !status.equals("CANCELLED")) {

                throw new BadRequestException(
                        "Invalid order status change"
                );
            }

        } else {

            // DELIVERED and CANCELLED are final states
            throw new BadRequestException(
                    "Order status cannot be changed"
            );
        }

        // Restore stock when order is cancelled
        if (status.equals("CANCELLED")) {

            List<OrderItem> orderItems =
                    orderItemRepository.findByOrder(order);

            for (OrderItem orderItem : orderItems) {

                Vegetable vegetable =
                        orderItem.getVegetable();

                vegetable.setStock(
                        vegetable.getStock()
                                + orderItem.getQuantity()
                );
            }
        }

        order.setStatus(status);

        orderRepository.save(order);
    }

    // CUSTOMER - CANCEL OWN ORDER
    public void cancelOrder(
            String email,
            Long orderId) {

        // Find logged-in customer
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Find order
        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        // Check order ownership
        if (!order.getUser().getUserId()
                .equals(user.getUserId())) {

            throw new RuntimeException(
                    "Order does not belong to this user"
            );
        }

        // Customer can cancel only placed order
        if (!order.getStatus().equals("PLACED")) {
            throw new BadRequestException(
                    "Order cannot be cancelled"
            );
        }

        // Restore vegetable stock
        List<OrderItem> orderItems =
                orderItemRepository.findByOrder(order);

        for (OrderItem orderItem : orderItems) {

            Vegetable vegetable =
                    orderItem.getVegetable();

            vegetable.setStock(
                    vegetable.getStock()
                            + orderItem.getQuantity()
            );
        }

        order.setStatus("CANCELLED");

        orderRepository.save(order);
    }

    // CONVERT ORDER ENTITY TO RESPONSE DTO
    private OrderResponse convertToResponse(Order order) {

        OrderResponse response = new OrderResponse();

        response.setOrderId(order.getOrderId());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setOrderDate(order.getOrderDate());

        // Add delivery details
        response.setDeliveryAddress(
                order.getDeliveryAddress()
        );

        response.setCity(
                order.getCity()
        );

        response.setState(
                order.getState()
        );

        response.setPincode(
                order.getPincode()
        );

        response.setPhoneNumber(
                order.getPhoneNumber()
        );

        // Add customer details
        User customer = order.getUser();

        response.setCustomerId(customer.getUserId());
        response.setCustomerEmail(customer.getEmail());

        // Fetch items of this order
        List<OrderItemResponse> itemResponses =
                orderItemRepository.findByOrder(order)
                        .stream()
                        .map(orderItem -> {

                            OrderItemResponse itemResponse =
                                    new OrderItemResponse();

                            Vegetable vegetable =
                                    orderItem.getVegetable();

                            itemResponse.setOrderItemId(
                                    orderItem.getOrderItemId()
                            );

                            itemResponse.setVegetableId(
                                    vegetable.getVegetableId()
                            );

                            itemResponse.setVegetableName(
                                    vegetable.getName()
                            );

                            itemResponse.setQuantity(
                                    orderItem.getQuantity()
                            );

                            // Use saved order price
                            itemResponse.setPrice(
                                    orderItem.getPrice()
                            );

                            itemResponse.setTotal(
                                    orderItem.getPrice()
                                            * orderItem.getQuantity()
                            );

                            return itemResponse;
                        })
                        .collect(java.util.stream.Collectors.toList());

        response.setItems(itemResponses);

        return response;
    }
}