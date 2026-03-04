package com.sorting.service;

import com.sorting.context.SortingContext;
import com.sorting.model.ArrayGenerationType;
import com.sorting.model.SortingStep;
import com.sorting.strategy.SortingStrategy;
import com.sorting.util.ArrayGenerator;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class VisualizationService {

    private final SortingContext sortingContext;
    private final ArrayGenerator arrayGenerator;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    public VisualizationService(SortingContext sortingContext, ArrayGenerator arrayGenerator) {
        this.sortingContext = sortingContext;
        this.arrayGenerator = arrayGenerator;
    }

    public SseEmitter streamVisualization(String algorithmName, int arraySize, String generationMode, int speed) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        ArrayGenerationType type = ArrayGenerationType.valueOf(generationMode.toUpperCase());
        int[] initialArray = arrayGenerator.generateArray(arraySize, type);

        long delay = Math.max(1, 101 - speed);

        executor.execute(() -> {
            try {
                SortingStep initialStep = new SortingStep(
                        initialArray, -1, -1,
                        new int[0], 0, 0, 0,
                        false);

                sendStep(emitter, initialStep, delay);

                SortingStrategy strategy = sortingContext.getStrategy(algorithmName);
                strategy.sortWithSteps(initialArray, step -> sendStep(emitter, step, delay));

                emitter.send(SseEmitter.event().name("COMPLETE").data("Sorting finished"));
                emitter.complete();

            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });
        return emitter;
    }

    private void sendStep(SseEmitter emitter, SortingStep step, long delay) {
        try {
            emitter.send(SseEmitter.event()
                    .name("message")
                    .data(step));

            Thread.sleep(delay);

        } catch (IOException | InterruptedException e) {
            emitter.completeWithError(e);
        }
    }
}
