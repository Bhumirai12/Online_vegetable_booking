package com.example.onlinevegetable.repository;

import com.example.onlinevegetable.entity.Vegetable;
import com.example.onlinevegetable.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VegetableRepository extends JpaRepository<Vegetable, Long> {
    List<Vegetable> findByCategory(Category category);
}
