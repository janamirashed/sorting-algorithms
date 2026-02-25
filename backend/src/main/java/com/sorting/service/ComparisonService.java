package com.sorting.service;

import com.sorting.context.SortingContext;
import com.sorting.model.*;
import com.sorting.strategy.SortingStrategy;
import com.sorting.util.ArrayGenerator;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ComparisonService {

    private final SortingContext sortingContext;
    private final ArrayGenerator arrayGenerator;

    public ComparisonService(SortingContext sortingContext, ArrayGenerator arrayGenerator) {
        this.sortingContext = sortingContext;
        this.arrayGenerator = arrayGenerator;
    }

    public List<ComparisonResult> compare(SortingRequest request) {
        List<ComparisonResult> results = new ArrayList<>();

        ArrayGenerationType generationType = ArrayGenerationType.valueOf(
                request.getGenerationMode().toUpperCase()
        );

        for (String algorithmName : request.getAlgorithmNames()) {
            SortingStrategy strategy = sortingContext.getStrategy(algorithmName);

            long totalRuntime = 0;
            long minRuntime = Long.MAX_VALUE;
            long maxRuntime = Long.MIN_VALUE;
            long totalComparisons = 0;
            long totalInterchanges = 0;

            for (int i = 0; i < request.getNumberOfRuns(); i++) {
                int[] array = arrayGenerator.generateArray(
                        request.getArraySize(), generationType
                );

                SortingResult sortingResult = strategy.sort(array);

                totalRuntime += sortingResult.getRuntimeNanos();
                minRuntime = Math.min(minRuntime, sortingResult.getRuntimeNanos());
                maxRuntime = Math.max(maxRuntime, sortingResult.getRuntimeNanos());
                totalComparisons += sortingResult.getComparisons();
                totalInterchanges += sortingResult.getInterchanges();
            }

            int runs = request.getNumberOfRuns();

            ComparisonResult result = new ComparisonResult(
                    algorithmName,
                    request.getArraySize(),
                    request.getGenerationMode(),
                    runs,
                    formatNanos(totalRuntime / runs),
                    formatNanos(minRuntime),
                    formatNanos(maxRuntime),
                    totalComparisons / runs,
                    totalInterchanges / runs
            );

            results.add(result);
        }

        return results;
    }

    private String formatNanos(long nanos) {
        if (nanos < 1_000) {
            return nanos + " ns";
        } else if (nanos < 1_000_000) {
            return String.format("%.2f µs", nanos / 1_000.0);
        } else if (nanos < 1_000_000_000) {
            return String.format("%.2f ms", nanos / 1_000_000.0);
        } else {
            return String.format("%.2f s", nanos / 1_000_000_000.0);
        }
    }
}
