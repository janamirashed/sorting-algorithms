package com.sorting.strategy;

import com.sorting.model.SortingResult;
import com.sorting.model.SortingStep;
import org.springframework.stereotype.Component;

import java.util.function.Consumer;

@Component
public class HeapSortStrategy implements SortingStrategy {
    @Override
    public SortingResult sort(int[] array) {
        int n = array.length;

        for (int i = n / 2 - 1; i >= 0; i--) {
            heapify(array, n, i);
        }

        for (int i = n - 1; i > 0; i--) {
            int temp = array[0];
            array[0] = array[i];
            array[i] = temp;

            heapify(array, i, 0);
        }

        return new SortingResult(array, 0, 0, 0);
    }

    private void heapify(int[] array, int n, int i) {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;

        if (left < n && array[left] > array[largest]) {
            largest = left;
        }

        if (right < n && array[right] > array[largest]) {
            largest = right;
        }

        if (largest != i) {
            int temp = array[i];
            array[i] = array[largest];
            array[largest] = temp;

            heapify(array, n, largest);
        }
    }

    @Override
    public void sortWithSteps(int[] array, Consumer<SortingStep> stepConsumer) {
        int[] counters = new int[] { 0, 0, 0 };
        int n = array.length;

        for (int i = n / 2 - 1; i >= 0; i--) {
            heapifyWithSteps(array, n, i, stepConsumer, counters);
        }

        for (int i = n - 1; i > 0; i--) {
            counters[2]++;
            int temp = array[0];
            array[0] = array[i];
            array[i] = temp;

            stepConsumer.accept(new SortingStep(
                    array.clone(), 0, i, null, ++counters[0], counters[1], counters[2], false));

            heapifyWithSteps(array, i, 0, stepConsumer, counters);
        }

        stepConsumer.accept(new SortingStep(
                array.clone(), -1, -1, null, ++counters[0], counters[1], counters[2], true));
    }

    private void heapifyWithSteps(int[] array, int n, int i, Consumer<SortingStep> stepConsumer, int[] counters) {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;

        if (left < n) {
            counters[1]++;
            stepConsumer.accept(new SortingStep(
                    array.clone(), left, largest, null, ++counters[0], counters[1], counters[2], false));
            if (array[left] > array[largest]) {
                largest = left;
            }
        }

        if (right < n) {
            counters[1]++;
            stepConsumer.accept(new SortingStep(
                    array.clone(), right, largest, null, ++counters[0], counters[1], counters[2], false));
            if (array[right] > array[largest]) {
                largest = right;
            }
        }

        if (largest != i) {
            int temp = array[i];
            array[i] = array[largest];
            array[largest] = temp;
            counters[2]++;

            stepConsumer.accept(new SortingStep(
                    array.clone(), i, largest, null, ++counters[0], counters[1], counters[2], false));

            heapifyWithSteps(array, n, largest, stepConsumer, counters);
        }
    }

    @Override
    public String getName() {
        return "Heap Sort";
    }
}
