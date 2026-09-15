package com.example.onlinevegetable.service;

import com.example.onlinevegetable.dto.CartItemRequest;
import com.example.onlinevegetable.entity.Cart;
import com.example.onlinevegetable.entity.CartItem;
import com.example.onlinevegetable.entity.User;
import com.example.onlinevegetable.entity.Vegetable;
import com.example.onlinevegetable.repository.CartItemRepository;
import com.example.onlinevegetable.repository.CartRepository;
import com.example.onlinevegetable.repository.UserRepository;
import com.example.onlinevegetable.repository.VegetableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.onlinevegetable.exception.BadRequestException;
import com.example.onlinevegetable.dto.CartItemResponse;
import java.util.List;
import java.util.stream.Collectors;
import com.example.onlinevegetable.dto.CartItemUpdateRequest;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VegetableRepository vegetableRepository;

    // ADD TO CART
    public void addToCartByEmail(
            String email,
            CartItemRequest request) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Vegetable vegetable = vegetableRepository
                .findById(request.getVegetableId())
                .orElseThrow(() ->
                        new RuntimeException("Vegetable not found"));

        if (request.getQuantity() > vegetable.getStock()) {
            throw new BadRequestException(
                    "Requested quantity is not available"
            );
        }

        Cart cart = cartRepository
                .findByUserUserId(user.getUserId())
                .orElseGet(() -> {

                    Cart newCart = new Cart();
                    newCart.setUser(user);

                    return cartRepository.save(newCart);
                });

        CartItem cartItem = cartItemRepository
                .findByCartAndVegetable(cart, vegetable)
                .orElse(null);

        if (cartItem != null) {

            int newQuantity =
                    cartItem.getQuantity()
                            + request.getQuantity();

            if (newQuantity > vegetable.getStock()) {
                throw new BadRequestException(
                        "Requested quantity is not available"
                );
            }

            cartItem.setQuantity(newQuantity);

        } else {

            cartItem = new CartItem();

            cartItem.setCart(cart);
            cartItem.setVegetable(vegetable);
            cartItem.setQuantity(request.getQuantity());
        }

        cartItemRepository.save(cartItem);
    }

    // GET CART
    public List<CartItemResponse> getCartByEmail(String email) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Cart cart = cartRepository
                .findByUserUserId(user.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));

        return cartItemRepository.findByCart(cart)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // update cart item
    public void updateCartItem(
            String email,
            Long cartItemId,
            CartItemUpdateRequest request) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Cart cart = cartRepository
                .findByUserUserId(user.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));

        CartItem cartItem = cartItemRepository
                .findById(cartItemId)
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getCartId()
                .equals(cart.getCartId())) {

            throw new RuntimeException(
                    "Cart item does not belong to this user"
            );
        }

        Vegetable vegetable = cartItem.getVegetable();

        if (request.getQuantity() > vegetable.getStock()) {
            throw new BadRequestException(
                    "Requested quantity is not available"
            );
        }

        cartItem.setQuantity(request.getQuantity());

        cartItemRepository.save(cartItem);
    }


    // REMOVE CART ITEM
    public void removeCartItem(
            String email,
            Long cartItemId) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Cart cart = cartRepository
                .findByUserUserId(user.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));

        CartItem cartItem = cartItemRepository
                .findById(cartItemId)
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getCartId()
                .equals(cart.getCartId())) {

            throw new RuntimeException(
                    "Cart item does not belong to this user"
            );
        }

        cartItemRepository.delete(cartItem);
    }

    // CLEAR CART
    public void clearCart(String email) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Cart cart = cartRepository
                .findByUserUserId(user.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));

        List<CartItem> cartItems =
                cartItemRepository.findByCart(cart);

        cartItemRepository.deleteAll(cartItems);
    }

    // CONVERT CART ITEM TO RESPONSE
    private CartItemResponse convertToResponse(CartItem cartItem) {

        CartItemResponse response = new CartItemResponse();

        Vegetable vegetable = cartItem.getVegetable();

        response.setCartItemId(cartItem.getCartItemId());
        response.setVegetableId(vegetable.getVegetableId());
        response.setVegetableName(vegetable.getName());
        response.setPrice(vegetable.getPrice());
        response.setQuantity(cartItem.getQuantity());

        response.setTotal(
                vegetable.getPrice() * cartItem.getQuantity()
        );

        return response;
    }
}

