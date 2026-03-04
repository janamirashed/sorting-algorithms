package com.sorting.strategy;

import com.sorting.model.SortingResult;
import com.sorting.model.SortingStep;
import org.springframework.stereotype.Component;

import java.util.function.Consumer;

@Component
public class QuickSortStrategy implements SortingStrategy {
    @Override
    public SortingResult sort(int[] array) {
        long[] counters = new long[] { 0, 0 }; // [comparisons, interchanges]
        long startTime = System.nanoTime();

        quickSort(array, 0, array.length - 1, counters);

        long runtimeNanos = System.nanoTime() - startTime;
        return new SortingResult(array, counters[0], counters[1], runtimeNanos);
    }

    private void quickSort(int[] array, int lowIdx, int highIdx, long[] counters) {
        if (lowIdx >= highIdx) {
            return;
        }

        int pivot = array[highIdx];
        int leftPtr = lowIdx;
        int rightPtr = highIdx;

        while (leftPtr < rightPtr) {
            while (array[leftPtr] <= pivot && leftPtr < rightPtr) {
                counters[0]++;
                leftPtr++;
            }
            while (array[rightPtr] >= pivot && leftPtr < rightPtr) {
                counters[0]++;
                rightPtr--;
            }

            if (leftPtr < rightPtr) {
                int temp = array[leftPtr];
                array[leftPtr] = array[rightPtr];
                array[rightPtr] = temp;
                counters[1]++;
            }
        }

        int temp = array[leftPtr];
        array[leftPtr] = array[highIdx];
        array[highIdx] = temp;
        counters[1]++;

        quickSort(array, lowIdx, leftPtr - 1, counters);
        quickSort(array, leftPtr + 1, highIdx, counters);
    }

    @Override
    public void sortWithSteps(int[] array, Consumer<SortingStep> stepConsumer) {
        int[] counters = new int[] { 0, 0, 0 };

        quickSortWithSteps(array, 0, array.length - 1, stepConsumer, counters);
        stepConsumer.accept(new SortingStep(
                array.clone(), -1, -1, null, ++counters[0], counters[1], counters[2], true));
    }

    private void quickSortWithSteps(int[] array, int lowIdx, int highIdx, Consumer<SortingStep> stepConsumer,
            int[] counters) {
        if (lowIdx >= highIdx) {
            return;
        }

        int pivot = array[highIdx];
        int leftPtr = lowIdx;
        int rightPtr = highIdx;

        while (leftPtr < rightPtr) {
            while (array[leftPtr] <= pivot && leftPtr < rightPtr) {
                counters[1]++;
                stepConsumer.accept(new SortingStep(
                        array.clone(), leftPtr, highIdx, null, ++counters[0], counters[1], counters[2], false));
                leftPtr++;
            }
            while (array[rightPtr] >= pivot && leftPtr < rightPtr) {
                counters[1]++;
                stepConsumer.accept(new SortingStep(
                        array.clone(), rightPtr, highIdx, null, ++counters[0], counters[1], counters[2], false));
                rightPtr--;
            }

            if (leftPtr < rightPtr) {
                int temp = array[leftPtr];
                array[leftPtr] = array[rightPtr];
                array[rightPtr] = temp;
                counters[2]++;

                stepConsumer.accept(new SortingStep(
                        array.clone(), leftPtr, rightPtr, null, ++counters[0], counters[1], counters[2], false));
            }
        }

        int temp = array[leftPtr];
        array[leftPtr] = array[highIdx];
        array[highIdx] = temp;
        counters[2]++;

        stepConsumer.accept(new SortingStep(
                array.clone(), leftPtr, highIdx, null, ++counters[0], counters[1], counters[2], false));

        quickSortWithSteps(array, lowIdx, leftPtr - 1, stepConsumer, counters);
        quickSortWithSteps(array, leftPtr + 1, highIdx, stepConsumer, counters);
    }

    @Override
    public String getName() {
        return "Quick Sort";
    }
}
