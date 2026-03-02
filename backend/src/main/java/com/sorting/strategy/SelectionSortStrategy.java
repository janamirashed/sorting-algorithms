package com.sorting.strategy;

import com.sorting.model.SortingResult;
import com.sorting.model.SortingStep;

import java.util.function.Consumer;

public class SelectionSortStrategy implements SortingStrategy {
    @Override
    public SortingResult sort(int[] array) {
        for(int i = 0; i < array.length - 1; i++) {
            int minIndex = i;
            for(int j = i + 1; j < array.length; j++) {
                if(array[j] < array[minIndex]) {
                    minIndex = j;
                }
            }

            int temp = array[minIndex];
            array[minIndex] = array[i];
            array[i] = temp;
        }
        return new SortingResult(array, 0, 0, 0);
    }

    @Override
    public void sortWithSteps(int[] array, Consumer<SortingStep> stepConsumer) {
        int stepCounter = 0;
        int comparisons = 0;
        int interchanges = 0;

        for(int i = 0; i < array.length - 1; i++) {
            int minIndex = i;
            for(int j = i + 1; j < array.length; j++) {
                comparisons++;

                stepConsumer.accept(new SortingStep(
                array.clone(), j, minIndex, null, ++stepCounter, comparisons, interchanges, false
            ));

                if(array[j] < array[minIndex]) {
                    minIndex = j;
                }
            }

            int temp = array[minIndex];
            array[minIndex] = array[i];
            array[i] = temp;
            interchanges++;
            stepConsumer.accept(new SortingStep(
            array.clone(), i, minIndex, null, ++stepCounter, comparisons, interchanges, false
        ));
        }

        stepConsumer.accept(new SortingStep(
            array.clone(), -1, -1, null, ++stepCounter, comparisons, interchanges, true
        ));
    }

    @Override
    public String getName() {
        return "Selection Sort";
    }
}
