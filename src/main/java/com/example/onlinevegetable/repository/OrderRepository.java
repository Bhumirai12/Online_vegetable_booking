package com.example.onlinevegetable.repository;

import com.example.onlinevegetable.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // Customer orders - latest first
    List<Order> findByUserUserIdOrderByOrderDateDesc(Long userId);

    // Admin - all orders latest first
    List<Order> findAllByOrderByOrderDateDesc();}
