package com.sorting.strategy;

import com.sorting.model.SortingResult;
import com.sorting.model.SortingStep;
import org.springframework.stereotype.Component;

import java.util.function.Consumer;

@Component
public class MergeSortStrategy implements SortingStrategy {
    @Override
    public SortingResult sort(int[] array) {
        long[] counters = new long[] { 0, 0 }; // [comparisons, interchanges]
        long startTime = System.nanoTime();

        mergeSort(array, counters);

        long runtimeNanos = System.nanoTime() - startTime;
        return new SortingResult(array, counters[0], counters[1], runtimeNanos);
    }

    private void mergeSort(int[] array, long[] counters) {
        int n = array.length;
        if (n < 2) {
            return;
        }

        int midIdx = n / 2;
        int[] leftHalf = new int[midIdx];
        int[] rightHalf = new int[n - midIdx];

        for (int i = 0; i < midIdx; i++) {
            leftHalf[i] = array[i];
        }
        for (int i = midIdx; i < n; i++) {
            rightHalf[i - midIdx] = array[i];
        }

        mergeSort(leftHalf, counters);
        mergeSort(rightHalf, counters);
        merge(array, leftHalf, rightHalf, counters);
    }

    private void merge(int[] array, int[] leftHalf, int[] rightHalf, long[] counters) {
        int leftSize = leftHalf.length;
        int rightSize = rightHalf.length;

        int i = 0, j = 0, k = 0;

        while (i < leftSize && j < rightSize) {
            counters[0]++; // comparison
            if (leftHalf[i] <= rightHalf[j]) {
                array[k] = leftHalf[i];
                i++;
            } else {
                array[k] = rightHalf[j];
                j++;
            }
            counters[1]++; // interchange
            k++;
        }

        while (i < leftSize) {
            array[k] = leftHalf[i];
            counters[1]++;
            i++;
            k++;
        }

        while (j < rightSize) {
            array[k] = rightHalf[j];
            counters[1]++;
            j++;
            k++;
        }
    }

    @Override
    public void sortWithSteps(int[] array, Consumer<SortingStep> stepConsumer) {
        int[] counters = new int[] { 0, 0, 0 }; // [stepNumber, comparisons, interchanges]

        mergeSortWithSteps(array, 0, array.length - 1, stepConsumer, counters);
        stepConsumer.accept(new SortingStep(
                array.clone(), -1, -1, new int[0], ++counters[0], counters[1], counters[2], true));
    }

    private void mergeSortWithSteps(int[] array, int left, int right, Consumer<SortingStep> stepConsumer,
            int[] counters) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSortWithSteps(array, left, mid, stepConsumer, counters);
            mergeSortWithSteps(array, mid + 1, right, stepConsumer, counters);
            mergeWithSteps(array, left, mid, right, stepConsumer, counters);
        }
    }

    private void mergeWithSteps(int[] array, int left, int mid, int right, Consumer<SortingStep> stepConsumer,
            int[] counters) {
        int n1 = mid - left + 1;
        int n2 = right - mid;

        int[] leftArr = new int[n1];
        int[] rightArr = new int[n2];

        for (int i = 0; i < n1; i++)
            leftArr[i] = array[left + i];
        for (int j = 0; j < n2; j++)
            rightArr[j] = array[mid + 1 + j];

        int i = 0, j = 0, k = left;

        while (i < n1 && j < n2) {
            counters[1]++; // comparison

            // Step: comparing left[i] vs right[j]
            stepConsumer.accept(new SortingStep(
                    array.clone(), left + i, mid + 1 + j, new int[0],
                    ++counters[0], counters[1], counters[2], false,
                    left, right, mid, left + i, mid + 1 + j, k));

            if (leftArr[i] <= rightArr[j]) {
                array[k] = leftArr[i];
                i++;
            } else {
                array[k] = rightArr[j];
                j++;
            }
            counters[2]++; // interchange

            // Step: element placed at write position k
            stepConsumer.accept(new SortingStep(
                    array.clone(), k, -1, new int[0],
                    ++counters[0], counters[1], counters[2], false,
                    left, right, mid, left + i, mid + 1 + j, k));

            k++;
        }

        while (i < n1) {
            array[k] = leftArr[i];
            counters[2]++;

            stepConsumer.accept(new SortingStep(
                    array.clone(), k, -1, new int[0],
                    ++counters[0], counters[1], counters[2], false,
                    left, right, mid, left + i, -1, k));

            i++;
            k++;
        }

        while (j < n2) {
            array[k] = rightArr[j];
            counters[2]++;

            stepConsumer.accept(new SortingStep(
                    array.clone(), k, -1, new int[0],
                    ++counters[0], counters[1], counters[2], false,
                    left, right, mid, -1, mid + 1 + j, k));

            j++;
            k++;
        }
    }

    @Override
    public String getName() {
        return "Merge Sort";
    }
}
