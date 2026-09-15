package com.example.onlinevegetable.repository;

import com.example.onlinevegetable.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    User findByResetOtp(String resetOtp);

}