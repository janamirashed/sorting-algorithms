package com.sorting.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ComparisonResult {
    private String algorithmName;
    private int arraySize;
    private String generationMode;
    private int numberOfRuns;
    private String avgRuntime;
    private String minRuntime;
    private String maxRuntime;
    private long comparisons;
    private long interchanges;
}
