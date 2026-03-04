package com.sorting.controller;

import com.sorting.service.VisualizationService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/visualize")
public class VisualizationController {
    private final VisualizationService visualizationService;

    public VisualizationController(VisualizationService visualizationService) {
        this.visualizationService = visualizationService;
    }

    @GetMapping(value = "/{algorithm}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamSorting(
            @PathVariable String algorithm,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "RANDOM") String mode,
            @RequestParam(defaultValue = "50") int speed,
            @RequestParam(required = false) String array) {

        if (array != null && !array.isEmpty()) {
            int[] customArray = java.util.Arrays.stream(array.split(","))
                    .map(String::trim)
                    .mapToInt(Integer::parseInt)
                    .toArray();
            return visualizationService.streamVisualization(algorithm, customArray, speed);
        }
        return visualizationService.streamVisualization(algorithm, size, mode, speed);
    }
}
