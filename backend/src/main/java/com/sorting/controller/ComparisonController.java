package com.sorting.controller;

import com.sorting.model.ComparisonResult;
import com.sorting.model.SortingRequest;
import com.sorting.service.ChartService;
import com.sorting.service.ComparisonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/compare")
public class ComparisonController {
    private final ComparisonService comparisonService;
    private final ChartService chartService;

    public ComparisonController(ComparisonService comparisonService, ChartService chartService) {
        this.comparisonService = comparisonService;
        this.chartService = chartService;
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
    public ResponseEntity<List<ComparisonResult>> compareWithFile(@RequestParam("file") MultipartFile file,
            @RequestParam("algorithmNames") List<String> algorithmNames,
            @RequestParam("numberOfRuns") int numberOfRuns) {
        if (algorithmNames == null || algorithmNames.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            List<ComparisonResult> results = comparisonService.compareWithFile(
                    file, algorithmNames, numberOfRuns);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/charts")
    public ResponseEntity<Map<String, String>> generateCharts(@RequestBody List<ComparisonResult> results) {
        if (results == null || results.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Map<String, String> charts = chartService.generateCharts(results);
            return ResponseEntity.ok(charts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
