package com.example.onlinevegetable.controller;

import com.example.onlinevegetable.dto.VegetableRequest;
import com.example.onlinevegetable.dto.VegetableResponse;
import com.example.onlinevegetable.service.VegetableService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.onlinevegetable.service.ImageService;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/vegetables")
public class VegetableController {

    @Autowired
    private VegetableService vegetableService;

    @Autowired
    private ImageService imageService;

    // ADD VEGETABLE
    @PostMapping
    public VegetableResponse addVegetable(
            @Valid @RequestBody VegetableRequest request) {

        return vegetableService.addVegetable(request);
    }

    // GET ALL VEGETABLES
    @GetMapping
    public List<VegetableResponse> getAllVegetables() {
        return vegetableService.getAllVegetables();
    }

    // GET VEGETABLES BY CATEGORY
    @GetMapping("/category/{categoryId}")
    public List<VegetableResponse> getVegetablesByCategory(
            @PathVariable Long categoryId) {

        return vegetableService.getVegetablesByCategory(categoryId);
    }

    // GET VEGETABLE BY ID
    @GetMapping("/{vegetableId}")
    public VegetableResponse getVegetableById(
            @PathVariable Long vegetableId) {

        return vegetableService.getVegetableById(vegetableId);
    }

    // UPDATE VEGETABLE
    @PutMapping("/{vegetableId}")
    public VegetableResponse updateVegetable(
            @PathVariable Long vegetableId,
            @Valid @RequestBody VegetableRequest request) {

        return vegetableService.updateVegetable(
                vegetableId,
                request
        );
    }

    // DELETE VEGETABLE
    @DeleteMapping("/{vegetableId}")
    public ResponseEntity<String> deleteVegetable(
            @PathVariable Long vegetableId) {

        vegetableService.deleteVegetable(vegetableId);

        return ResponseEntity.ok(
                "Vegetable deleted successfully"
        );
    }

    // NEW IMAGE UPLOAD API
    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadVegetableImage(
            @RequestParam("image") MultipartFile image) {

        String imageUrl = imageService.saveImage(image);

        return ResponseEntity.ok(
                Map.of("imageUrl", imageUrl)
        );
    }


}
