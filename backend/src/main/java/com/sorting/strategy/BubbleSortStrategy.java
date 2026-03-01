package com.sorting.strategy;

import com.sorting.model.SortingResult;
import com.sorting.model.SortingStep;

import java.util.function.Consumer;

public class BubbleSortStrategy implements SortingStrategy {
    @Override
    public SortingResult sort(int[] array) {
        boolean isSwaped = true;

        while(isSwaped) {
            isSwaped = false;
            for (int i = 0; i < array.length - 1; i++) {
                if(array[i] > array[i + 1]) {
                    isSwaped = true;
                    int temp = array[i];
                    array[i] = array[i + 1];
                    array[i + 1] = temp;
                }
            }
        }

        return new SortingResult(array, 0, 0, 0);
    }

    @Override
    public void sortWithSteps(int[] array, Consumer<SortingStep> stepConsumer) {
        boolean isSwaped = true;
        int stepCounter = 0;
        long comparisons = 0;
        long interchanges = 0;

        while(isSwaped) {
            isSwaped = false;
            for (int i = 0; i < array.length - 1; i++) {
                comparisons++;

                stepConsumer.accept(new SortingStep(
                    array.clone(),
                    i,
                    i + 1,
                    null,
                    stepCounter,
                    comparisons,
                    interchanges,
                    false
                ));

                if(array[i] > array[i + 1]) {
                    isSwaped = true;
                    int temp = array[i];
                    array[i] = array[i + 1];
                    array[i + 1] = temp;
                    interchanges++;

                    stepConsumer.accept(new SortingStep(
                        array.clone(),
                        i,
                        i + 1,
                        null,
                        stepCounter,
                        comparisons,
                        interchanges,
                        false
                    ));
                }
            }
        }

        stepConsumer.accept(new SortingStep(
            array.clone(),
            -1,
            -1,
            null,
            stepCounter,
            comparisons,
            interchanges,
            true
        ));
    }

    @Override
    public String getName() {
        return "Bubble Sort";
    }
}
