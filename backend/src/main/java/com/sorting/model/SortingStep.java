package com.sorting.model;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
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

    // Merge sort specific fields
    private int mergeRangeStart = -1;
    private int mergeRangeEnd = -1;
    private int midPoint = -1;
    private int leftPointer = -1;
    private int rightPointer = -1;
    private int writePointer = -1;

    // Original constructor (used by all algorithms)
    public SortingStep(int[] array, int comparingIndices, int swappingIndices,
            int[] sortedIndices, int stepNumber, long totalComparisons,
            long totalInterchanges, boolean isComplete) {
        this.array = array;
        this.comparingIndices = comparingIndices;
        this.swappingIndices = swappingIndices;
        this.sortedIndices = sortedIndices;
        this.stepNumber = stepNumber;
        this.totalComparisons = totalComparisons;
        this.totalInterchanges = totalInterchanges;
        this.isComplete = isComplete;
    }

    // Extended constructor for merge sort
    public SortingStep(int[] array, int comparingIndices, int swappingIndices,
            int[] sortedIndices, int stepNumber, long totalComparisons,
            long totalInterchanges, boolean isComplete,
            int mergeRangeStart, int mergeRangeEnd, int midPoint,
            int leftPointer, int rightPointer, int writePointer) {
        this(array, comparingIndices, swappingIndices, sortedIndices,
                stepNumber, totalComparisons, totalInterchanges, isComplete);
        this.mergeRangeStart = mergeRangeStart;
        this.mergeRangeEnd = mergeRangeEnd;
        this.midPoint = midPoint;
        this.leftPointer = leftPointer;
        this.rightPointer = rightPointer;
        this.writePointer = writePointer;
    }
}
