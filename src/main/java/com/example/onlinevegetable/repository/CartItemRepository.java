package com.example.onlinevegetable.repository;

import com.example.onlinevegetable.entity.Cart;
import com.example.onlinevegetable.entity.CartItem;
import com.example.onlinevegetable.entity.Vegetable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndVegetable(
            Cart cart,
            Vegetable vegetable
    );

    List<CartItem> findByCart(Cart cart);
}
