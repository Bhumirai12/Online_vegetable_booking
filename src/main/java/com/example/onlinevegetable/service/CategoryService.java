package com.example.onlinevegetable.service;

import com.example.onlinevegetable.dto.CategoryRequest;
import com.example.onlinevegetable.entity.Category;
import com.example.onlinevegetable.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    // CREATE CATEGORY
    public Category createCategory(CategoryRequest request) {

        Category category = new Category();

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        return categoryRepository.save(category);
    }

    // GET ALL CATEGORIES
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // GET CATEGORY BY ID
    public Category getCategoryById(Long categoryId) {

        return categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));
    }

    // UPDATE CATEGORY
    public Category updateCategory(
            Long categoryId,
            CategoryRequest request) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        return categoryRepository.save(category);
    }

    // DELETE CATEGORY
    public void deleteCategory(Long categoryId) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        categoryRepository.delete(category);
    }
}
