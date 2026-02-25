package com.sorting.util;

import com.sorting.model.ArrayGenerationType;
import org.springframework.stereotype.Component;

import java.util.Random;
import java.util.stream.IntStream;

@Component
public class ArrayGenerator {
    private final Random random = new Random();

    public int[] generateArray(int size, ArrayGenerationType type) {
        return switch (type) {
            case RANDOM -> generateRandom(size);
            case SORTED -> generateSorted(size);
            case INVERSELY_SORTED -> generateInverselySorted(size);
        };
    }

    private int[] generateRandom(int size) {
        return random.ints(size, 1, size + 1).toArray();
    }

    private int[] generateSorted(int size) {
        return IntStream.rangeClosed(1, size).toArray();
    }

    private int[] generateInverselySorted(int size) {
        return IntStream.iterate(size, i -> i - 1)
                .limit(size)
                .toArray();
    }
}
