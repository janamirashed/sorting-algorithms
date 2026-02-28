package com.sorting.controller;

import com.sorting.model.ComparisonResult;
import com.sorting.model.SortingRequest;
import com.sorting.service.ComparisonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/compare")
@CrossOrigin(origins = "*")
public class ComparisonController {
    private final ComparisonService comparisonService;

    public ComparisonController(ComparisonService comparisonService) {
        this.comparisonService = comparisonService;
    }

    @PostMapping
    public ResponseEntity<List<ComparisonResult>> compareAlgorithms(@RequestBody SortingRequest request) {
        if (request.getAlgorithmNames() == null || request.getAlgorithmNames().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<ComparisonResult> results = comparisonService.compare(request);

        return ResponseEntity.ok(results);
    }

    @PostMapping("/file")
    public ResponseEntity<List<ComparisonResult>> compareWithFile (@RequestParam("file") MultipartFile file,
                                                                   @RequestParam("algorithmNames") List<String> algorithmNames,
                                                                   @RequestParam("numberOfRuns") int numberOfRuns) {
        if (algorithmNames == null || algorithmNames.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            List<ComparisonResult> results = comparisonService.compareWithFile(
                    file, algorithmNames, numberOfRuns
            );
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
