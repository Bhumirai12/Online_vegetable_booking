package com.example.onlinevegetable.repository;

import com.example.onlinevegetable.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository  extends JpaRepository<Category, Long>  {
}
