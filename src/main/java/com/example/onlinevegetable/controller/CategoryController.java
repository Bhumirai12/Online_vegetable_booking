package com.example.onlinevegetable.controller;

import com.example.onlinevegetable.dto.CategoryRequest;
import com.example.onlinevegetable.entity.Category;
import com.example.onlinevegetable.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    // CREATE CATEGORY
    @PostMapping
    public Category createCategory(
            @Valid @RequestBody CategoryRequest request) {

        return categoryService.createCategory(request);
    }

    // GET ALL CATEGORIES
    @GetMapping
    public List<Category> getAllCategories() {

        return categoryService.getAllCategories();
    }

    // GET CATEGORY BY ID
    @GetMapping("/{categoryId}")
    public Category getCategoryById(
            @PathVariable Long categoryId) {

        return categoryService.getCategoryById(categoryId);
    }

    // UPDATE CATEGORY
    @PutMapping("/{categoryId}")
    public Category updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryRequest request) {

        return categoryService.updateCategory(
                categoryId,
                request
        );
    }

    // DELETE CATEGORY
    @DeleteMapping("/{categoryId}")
    public String deleteCategory(
            @PathVariable Long categoryId) {

        categoryService.deleteCategory(categoryId);

        return "Category deleted successfully";
    }
}
