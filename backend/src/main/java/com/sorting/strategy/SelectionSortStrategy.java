package com.sorting.strategy;

import com.sorting.model.SortingResult;
import com.sorting.model.SortingStep;
import org.springframework.stereotype.Component;

import java.util.function.Consumer;

@Component
public class SelectionSortStrategy implements SortingStrategy {
    @Override
    public SortingResult sort(int[] array) {
        long comparisons = 0;
        long interchanges = 0;
        long startTime = System.nanoTime();

        for (int i = 0; i < array.length - 1; i++) {
            int minIndex = i;
            for (int j = i + 1; j < array.length; j++) {
                comparisons++;
                if (array[j] < array[minIndex]) {
                    minIndex = j;
                }
            }

            if (minIndex != i) {
                int temp = array[minIndex];
                array[minIndex] = array[i];
                array[i] = temp;
                interchanges++;
            }
        }

        long runtimeNanos = System.nanoTime() - startTime;
        return new SortingResult(array, comparisons, interchanges, runtimeNanos);
    }

    @Override
    public void sortWithSteps(int[] array, Consumer<SortingStep> stepConsumer) {
        int stepCounter = 0;
        int comparisons = 0;
        int interchanges = 0;

        for (int i = 0; i < array.length - 1; i++) {
            int minIndex = i;
            for (int j = i + 1; j < array.length; j++) {
                comparisons++;

                stepConsumer.accept(new SortingStep(
                        array.clone(), j, minIndex, new int[0], ++stepCounter, comparisons, interchanges, false));

                if (array[j] < array[minIndex]) {
                    minIndex = j;
                }
            }

            if (minIndex != i) {
                int temp = array[minIndex];
                array[minIndex] = array[i];
                array[i] = temp;
                interchanges++;
            }
            stepConsumer.accept(new SortingStep(
                    array.clone(), i, minIndex, new int[0], ++stepCounter, comparisons, interchanges, false));
        }

        stepConsumer.accept(new SortingStep(
                array.clone(), -1, -1, new int[0], ++stepCounter, comparisons, interchanges, true));
    }

    @Override
    public String getName() {
        return "Selection Sort";
    }
}
