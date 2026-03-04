package com.sorting.util;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Arrays;

@Component
public class FileParser {
    public int[] parseFile(MultipartFile file) throws IOException {
        BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()));

        StringBuilder content = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            content.append(line).append(" ");
        }
        reader.close();

        // Remove brackets if they exist and split the string
        return Arrays.stream(content.toString().replaceAll("[\\[\\]]", "").trim().split("[,\\s]+"))
                .filter(s -> !s.isEmpty())
                .mapToInt(Integer::parseInt)
                .toArray();
    }
}
