package com.example.onlinevegetable.repository;

import com.example.onlinevegetable.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
public interface CartRepository  extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserUserId(Long userId);
}
