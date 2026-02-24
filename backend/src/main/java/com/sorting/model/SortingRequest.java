package com.sorting.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SortingRequest {
    private List<String> algorithmNames;
    private int arraySize;
    private String generationMode;
    private int numberOfRuns;
}
