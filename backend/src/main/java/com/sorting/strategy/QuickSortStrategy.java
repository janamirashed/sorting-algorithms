package com.sorting.strategy;

import com.sorting.model.SortingResult;
import com.sorting.model.SortingStep;
import org.springframework.stereotype.Component;

import java.util.function.Consumer;

@Component
public class QuickSortStrategy implements SortingStrategy {
    @Override
    public SortingResult sort(int[] array) {
        quickSort(array, 0, array.length - 1);
        return new SortingResult(array, 0, 0, 0);
    }

    private void quickSort(int[] array, int lowIdx, int highIdx) {
        if (lowIdx >= highIdx) {
            return;
        }

        int pivot = array[highIdx];
        int leftPtr = lowIdx;
        int rightPtr = highIdx;

        while (leftPtr < rightPtr) {
            while (array[leftPtr] <= pivot && leftPtr < rightPtr) {
                leftPtr++;
            }
            while (array[rightPtr] >= pivot && leftPtr < rightPtr) {
                rightPtr--;
            }

            int temp = array[leftPtr];
            array[leftPtr] = array[rightPtr];
            array[rightPtr] = temp;
        }

        int temp = array[leftPtr];
        array[leftPtr] = array[highIdx];
        array[highIdx] = temp;

        quickSort(array, lowIdx, leftPtr - 1);
        quickSort(array, leftPtr + 1, highIdx);
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
        counters[2]++;o

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
