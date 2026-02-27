package com.sorting.controller;

import com.sorting.service.VisualizationService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/visualize")
@CrossOrigin(origins = "*")
public class VisualizationController {
    private final VisualizationService visualizationService;

    public VisualizationController(VisualizationService visualizationService) {
        this.visualizationService = visualizationService;
    }

    @GetMapping(value = "/{algorithm}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamSorting(
            @PathVariable String algorithm,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "RANDOM") String mode) {

        return visualizationService.streamVisualization(algorithm, size, mode);
    }
}
