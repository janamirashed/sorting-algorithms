package com.sorting.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SortingResult {
    private int[] sortedArray;
    private long comparisons;
    private long interchanges;
    private long runtimeNanos;
}
