package com.sorting.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SortingStep {
    private int[] array;
    private int comparingIndices;
    private int swappingIndices;
    private int[] sortedIndices;
    private int stepNumber;
    private long totalComparisons;
    private long totalInterchanges;
    private boolean isComplete;
}
