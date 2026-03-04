package com.sorting.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sorting.model.ComparisonResult;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@Service
public class ChartService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, String> generateCharts(List<ComparisonResult> results) throws Exception {
        // Write results to a temp CSV file
        Path csvFile = Files.createTempFile("sorting_comparison_", ".csv");

        try (PrintWriter writer = new PrintWriter(csvFile.toFile())) {
            writer.println(
                    "Algorithm,Array Size,Generation Mode,Number of Runs,Avg Runtime,Min Runtime,Max Runtime,Comparisons,Interchanges");

            for (ComparisonResult r : results) {
                writer.printf("%s,%d,%s,%d,%s,%s,%s,%d,%d%n",
                        r.getAlgorithmName(),
                        r.getArraySize(),
                        r.getGenerationMode(),
                        r.getNumberOfRuns(),
                        r.getAvgRuntime(),
                        r.getMinRuntime(),
                        r.getMaxRuntime(),
                        r.getComparisons(),
                        r.getInterchanges());
            }
        }

        // Find graph.py relative to the project root
        String projectRoot = System.getProperty("user.dir");
        // Go up one level if we're in the backend directory
        File graphScript = new File(projectRoot, "graph.py");
        if (!graphScript.exists()) {
            graphScript = new File(projectRoot, "../graph.py");
        }

        // Run the Python script
        ProcessBuilder pb = new ProcessBuilder("python3", graphScript.getAbsolutePath(), csvFile.toString());
        pb.redirectErrorStream(false);
        Process process = pb.start();

        // Read stdout (JSON with base64 charts)
        String output;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            output = sb.toString();
        }

        // Read stderr for error messages
        String errorOutput;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            errorOutput = sb.toString();
        }

        int exitCode = process.waitFor();

        // Clean up temp file
        Files.deleteIfExists(csvFile);

        if (exitCode != 0) {
            throw new RuntimeException("Python script failed (exit code " + exitCode + "): " + errorOutput);
        }

        // Parse JSON output: { "runtime": "base64...", "comparisons": "base64...",
        // "interchanges": "base64..." }
        return objectMapper.readValue(output, new TypeReference<Map<String, String>>() {
        });
    }
}
