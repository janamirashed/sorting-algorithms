package com.sorting.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SortingStep {
    private int[] array;
    private int comparingIndcies;
    private int swappingIndcies;
    private int[] sortedIndcies;
    private int stepNumber;
    private long totalComparisons;
    private long totalInterchanges;
    private boolean isComplete;
}
