package com.example.onlinevegetable.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ImageService {

    private final Path imageDirectory =
            Paths.get("src/main/resources/static/images/vegetables");

    public String saveImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Image file is required");
        }

        try {
            // Keep using your existing vegetable image folder
            Files.createDirectories(imageDirectory);

            String originalFilename = file.getOriginalFilename();

            if (originalFilename == null || originalFilename.isBlank()) {
                throw new RuntimeException("Invalid image file");
            }

            // Unique name prevents accidentally replacing an existing image
            String fileName =
                    UUID.randomUUID() + "_" + originalFilename;

            Path targetPath = imageDirectory.resolve(fileName);

            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            // Same URL format your existing vegetables already use
            return "/images/vegetables/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to save vegetable image");
        }
    }
}
