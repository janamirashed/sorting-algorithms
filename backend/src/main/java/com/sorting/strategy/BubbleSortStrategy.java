package com.sorting.strategy;

import com.sorting.model.SortingResult;
import com.sorting.model.SortingStep;
import org.springframework.stereotype.Component;

import java.util.function.Consumer;

@Component
public class BubbleSortStrategy implements SortingStrategy {
    @Override
    public SortingResult sort(int[] array) {
        long comparisons = 0;
        long interchanges = 0;
        long startTime = System.nanoTime();

        boolean isSwaped = true;

        while (isSwaped) {
            isSwaped = false;
            for (int i = 0; i < array.length - 1; i++) {
                comparisons++;
                if (array[i] > array[i + 1]) {
                    isSwaped = true;
                    int temp = array[i];
                    array[i] = array[i + 1];
                    array[i + 1] = temp;
                    interchanges++;
                }
            }
        }

        long runtimeNanos = System.nanoTime() - startTime;
        return new SortingResult(array, comparisons, interchanges, runtimeNanos);
    }

    @Override
    public void sortWithSteps(int[] array, Consumer<SortingStep> stepConsumer) {
        boolean isSwaped = true;
        int stepCounter = 0;
        long comparisons = 0;
        long interchanges = 0;

        while (isSwaped) {
            isSwaped = false;
            for (int i = 0; i < array.length - 1; i++) {
                comparisons++;

                stepConsumer.accept(new SortingStep(
                        array.clone(),
                        i,
                        i + 1,
                        new int[0],
                        ++stepCounter,
                        comparisons,
                        interchanges,
                        false));

                if (array[i] > array[i + 1]) {
                    isSwaped = true;
                    int temp = array[i];
                    array[i] = array[i + 1];
                    array[i + 1] = temp;
                    interchanges++;

                    stepConsumer.accept(new SortingStep(
                            array.clone(),
                            i,
                            i + 1,
                            new int[0],
                            ++stepCounter,
                            comparisons,
                            interchanges,
                            false));
                }
            }
        }

        stepConsumer.accept(new SortingStep(
                array.clone(),
                -1,
                -1,
                new int[0],
                stepCounter,
                comparisons,
                interchanges,
                true));
    }

    @Override
    public String getName() {
        return "Bubble Sort";
    }
}
