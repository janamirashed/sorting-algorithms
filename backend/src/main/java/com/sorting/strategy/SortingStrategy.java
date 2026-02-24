package com.sorting.strategy;

import com.sorting.model.SortingResult;
import com.sorting.model.SortingStep;
import java.util.function.Consumer;

public interface SortingStrategy {
    SortingResult sort(int[] array);
    void sortWithSteps(int[] array, Consumer<SortingStep> stepConsumer);
    String getName();
}