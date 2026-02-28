package com.sorting.service;

import com.sorting.context.SortingContext;
import com.sorting.model.*;
import com.sorting.strategy.SortingStrategy;
import com.sorting.util.ArrayGenerator;
import com.sorting.util.FileParser;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ComparisonService {

    private final SortingContext sortingContext;
    private final ArrayGenerator arrayGenerator;
    private final FileParser fileParser;

    public ComparisonService(SortingContext sortingContext, ArrayGenerator arrayGenerator, FileParser fileParser) {
        this.sortingContext = sortingContext;
        this.arrayGenerator = arrayGenerator;
        this.fileParser = fileParser;
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

    public List<ComparisonResult> compareWithFile(MultipartFile file, List<String> algorithmNames, int numberOfRuns) throws IOException {
        List<ComparisonResult> results = new ArrayList<>();

        int[] baseArray = fileParser.parseFile(file);
        String fileName = file.getOriginalFilename();

        for (String algorithmName : algorithmNames) {
            SortingStrategy strategy = sortingContext.getStrategy(algorithmName);

            long totalRuntime = 0;
            long minRuntime = Long.MAX_VALUE;
            long maxRuntime = Long.MIN_VALUE;
            long totalComparisons = 0;
            long totalInterchanges = 0;

            for (int i = 0; i < numberOfRuns; i++) {
                int[] array = baseArray.clone();

                SortingResult sortingResult = strategy.sort(array);

                totalRuntime += sortingResult.getRuntimeNanos();
                minRuntime = Math.min(minRuntime, sortingResult.getRuntimeNanos());
                maxRuntime = Math.max(maxRuntime, sortingResult.getRuntimeNanos());
                totalComparisons += sortingResult.getComparisons();
                totalInterchanges += sortingResult.getInterchanges();
            }


            ComparisonResult result = new ComparisonResult(
                    algorithmName,
                    baseArray.length,
                    fileName,
                    numberOfRuns,
                    formatNanos(totalRuntime / numberOfRuns),
                    formatNanos(minRuntime),
                    formatNanos(maxRuntime),
                    totalComparisons / numberOfRuns,
                    totalInterchanges / numberOfRuns
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
