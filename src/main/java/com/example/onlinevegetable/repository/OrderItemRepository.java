package com.example.onlinevegetable.repository;

import com.example.onlinevegetable.entity.Order;
import com.example.onlinevegetable.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository
        extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder(Order order);

}
