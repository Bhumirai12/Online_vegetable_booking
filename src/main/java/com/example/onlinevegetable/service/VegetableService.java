package com.example.onlinevegetable.service;

import com.example.onlinevegetable.dto.VegetableRequest;
import com.example.onlinevegetable.dto.VegetableResponse;
import com.example.onlinevegetable.entity.Vegetable;
import com.example.onlinevegetable.repository.VegetableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.onlinevegetable.entity.Category;
import com.example.onlinevegetable.repository.CategoryRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VegetableService {

    @Autowired
    private VegetableRepository vegetableRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // ADD VEGETABLE
    public VegetableResponse addVegetable(VegetableRequest request) {

        Vegetable vegetable = new Vegetable();

        vegetable.setName(request.getName());
        vegetable.setDescription(request.getDescription());
        vegetable.setPrice(request.getPrice());
        vegetable.setStock(request.getStock());
        vegetable.setUnit(request.getUnit());
        vegetable.setImageUrl(request.getImageUrl());
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        vegetable.setCategory(category);

        Vegetable savedVegetable =
                vegetableRepository.save(vegetable);

        return convertToDTO(savedVegetable);
    }

    // GET ALL VEGETABLES
    public List<VegetableResponse> getAllVegetables() {

        return vegetableRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // GET VEGETABLES BY CATEGORY
    public List<VegetableResponse> getVegetablesByCategory(
            Long categoryId) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        return vegetableRepository.findByCategory(category)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // GET VEGETABLE BY ID
    public VegetableResponse getVegetableById(Long vegetableId) {

        Vegetable vegetable = vegetableRepository
                .findById(vegetableId)
                .orElseThrow(() ->
                        new RuntimeException("Vegetable not found"));

        return convertToDTO(vegetable);
    }

    // UPDATE VEGETABLE
    public VegetableResponse updateVegetable(
            Long vegetableId,
            VegetableRequest request) {

        Vegetable vegetable = vegetableRepository
                .findById(vegetableId)
                .orElseThrow(() ->
                        new RuntimeException("Vegetable not found"));

        vegetable.setName(request.getName());
        vegetable.setDescription(request.getDescription());
        vegetable.setPrice(request.getPrice());
        vegetable.setStock(request.getStock());
        vegetable.setImageUrl(request.getImageUrl());
        vegetable.setUnit(request.getUnit());
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        vegetable.setCategory(category);
        Vegetable updatedVegetable =
                vegetableRepository.save(vegetable);

        return convertToDTO(updatedVegetable);
    }

    // DELETE VEGETABLE
    public void deleteVegetable(Long vegetableId) {

        Vegetable vegetable = vegetableRepository
                .findById(vegetableId)
                .orElseThrow(() ->
                        new RuntimeException("Vegetable not found"));

        vegetableRepository.delete(vegetable);
    }

    // ENTITY TO DTO
    private VegetableResponse convertToDTO(Vegetable vegetable) {

        VegetableResponse response = new VegetableResponse();

        response.setVegetableId(vegetable.getVegetableId());
        response.setName(vegetable.getName());
        response.setDescription(vegetable.getDescription());
        response.setPrice(vegetable.getPrice());
        response.setStock(vegetable.getStock());
        response.setUnit(vegetable.getUnit());
        response.setCategory(vegetable.getCategory().getName());
        response.setImageUrl(vegetable.getImageUrl());
        return response;
    }
}
