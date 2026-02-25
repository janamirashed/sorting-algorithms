package com.sorting.context;

import com.sorting.strategy.SortingStrategy;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class SortingContext {

    private final Map<String, SortingStrategy> strategyMap;

    public SortingContext(List<SortingStrategy> strategies) {
        this.strategyMap = strategies.stream()
                .collect(Collectors.toMap(SortingStrategy::getName, s -> s));
    }

    public SortingStrategy getStrategy(String algorithmName) {
        SortingStrategy strategy = strategyMap.get(algorithmName);
        if (strategy == null) {
            throw new IllegalArgumentException("Unknown algorithm: " + algorithmName);
        }
        return strategy;
    }


}
