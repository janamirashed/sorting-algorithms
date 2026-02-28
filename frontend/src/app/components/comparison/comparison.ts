import { Component } from '@angular/core';
import {FormBuilder, FormsModule} from '@angular/forms';
import { ComparisonResult } from '../../models/comparison-result.model';
import { SortingService } from '../../services/sorting.service';

@Component({
  selector: 'app-comparison',
  imports: [FormsModule],
  templateUrl: './comparison.html',
  styleUrl: './comparison.css',
})
export class Comparison {
  algorithms: string[] = [
    'Selection Sort',
    'Insertion Sort',
    'Bubble Sort',
    'Merge Sort',
    'Heap Sort',
    'Quick Sort',
  ];

  selectedAlgorithms: string[] = [];
  arrayType: string = 'RANDOM';
  arraySize: number = 1000;
  numberOfRuns: number = 5;
  selectedFile: File | null = null;
  results: ComparisonResult[] = [];

  constructor(private sortingService: SortingService) {}

  toggleAlgorithm(algo: string): void {
    const index = this.selectedAlgorithms.indexOf(algo);
    if (index > -1) {
      this.selectedAlgorithms.splice(index, 1);
    } else {
      this.selectedAlgorithms.push(algo);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  runComparison(): void {
    if (this.selectedFile) {
      this.sortingService.compareWithFile(
        this.selectedFile,
        this.selectedAlgorithms,
        this.numberOfRuns
      ).subscribe({
        next: data => this.results = data,
        error: (err) => console.error('Comparison failed:', err),
      });
    } else {
      this.sortingService.compare({
        algorithmNames: this.selectedAlgorithms,
        arraySize: this.arraySize,
        generationMode: this.arrayType,
        numberOfRuns: this.numberOfRuns,
      }).subscribe({
        next: data => this.results = data,
        error: (err) => console.error('Comparison failed:', err),
      });
    }
  }

  clearResults(): void {
    this.results = [];
    this.selectedFile = null;
  }
}
