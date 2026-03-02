package com.sorting.strategy;

import com.sorting.model.SortingResult;
import com.sorting.model.SortingStep;
import org.springframework.stereotype.Component;

import java.util.function.Consumer;

@Component
public class InsertionSortStrategy implements SortingStrategy {
    @Override
    public SortingResult sort(int[] array) {
        for (int i = 1; i < array.length; i++) {
            int key = array[i];
            int j = i - 1;

            while (j >= 0 && array[j] > key) {
                array[j + 1] = array[j];
                j--;
            }
            array[j + 1] = key;
        }

        return new SortingResult(array, 0, 0, 0);
    }

    @Override
    public void sortWithSteps(int[] array, Consumer<SortingStep> stepConsumer) {
        int comparisons = 0;
        int interchanges = 0;
        int stepCounter = 0;

        for (int i = 1; i < array.length; i++) {
            int key = array[i];
            int j = i - 1;

            stepConsumer.accept(new SortingStep(
                    array.clone(),
                    i,
                    j,
                    null,
                    stepCounter,
                    comparisons,
                    interchanges,
                    false));

            while (j >= 0 && array[j] > key) {
                comparisons++;
                array[j + 1] = array[j];
                interchanges++;

                stepConsumer.accept(new SortingStep(
                        array.clone(),
                        i,
                        j,
                        null,
                        stepCounter,
                        comparisons,
                        interchanges,
                        false));

                j--;
            }

            if (j >= 0) {
                comparisons++;
            }
            array[j + 1] = key;
            stepConsumer.accept(new SortingStep(
                    array.clone(), j + 1, -1, null, ++stepCounter, comparisons, interchanges, false));
        }

        stepConsumer.accept(new SortingStep(
                array.clone(), -1, -1, null, ++stepCounter, comparisons, interchanges, true));
    }

    @Override
    public String getName() {
        return "Insertion Sort";
    }
}
