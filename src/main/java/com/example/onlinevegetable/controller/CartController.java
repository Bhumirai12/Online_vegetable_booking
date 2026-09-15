package com.example.onlinevegetable.controller;

import com.example.onlinevegetable.dto.CartItemRequest;
import com.example.onlinevegetable.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.onlinevegetable.dto.CartItemResponse;
import java.util.List;
import com.example.onlinevegetable.dto.CartItemUpdateRequest;
import org.springframework.security.core.Authentication;
import com.example.onlinevegetable.entity.User;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    // ADD TO CART
    @PostMapping
    public ResponseEntity<String> addToCart(
            Authentication authentication,
            @Valid @RequestBody CartItemRequest request) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        cartService.addToCartByEmail(email, request);

        return ResponseEntity.ok(
                "Vegetable added to cart successfully"
        );
    }


    // GET CART
    @GetMapping
    public List<CartItemResponse> getCart(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        return cartService.getCartByEmail(email);
    }

    // UPDATE CART ITEM
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<String> updateCartItem(
            Authentication authentication,
            @PathVariable Long cartItemId,
            @Valid @RequestBody CartItemUpdateRequest request) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        cartService.updateCartItem(
                email,
                cartItemId,
                request
        );

        return ResponseEntity.ok(
                "Cart item updated successfully"
        );
    }


    // REMOVE CART ITEM
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<String> removeCartItem(
            Authentication authentication,
            @PathVariable Long cartItemId) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        cartService.removeCartItem(
                email,
                cartItemId
        );

        return ResponseEntity.ok(
                "Cart item removed successfully"
        );
    }

    // CLEAR CART
    @DeleteMapping
    public ResponseEntity<String> clearCart(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();

        cartService.clearCart(email);

        return ResponseEntity.ok(
                "Cart cleared successfully"
        );
    }
}
