package com.sorting.strategy;

import com.sorting.model.SortingResult;
import com.sorting.model.SortingStep;

import java.util.function.Consumer;

public class QuickSortStrategy implements SortingStrategy {
    @Override
    public SortingResult sort(int[] array) {
        return null;
    }

    @Override
    public void sortWithSteps(int[] array, Consumer<SortingStep> stepConsumer) {

    }

    @Override
    public String getName() {
        return "Quick Sort";
    }
}
