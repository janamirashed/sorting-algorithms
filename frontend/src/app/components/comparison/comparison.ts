import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ComparisonResult {
  algorithmName: string;
  arraySize: number;
  generationMode: string;
  numberOfRuns: number;
  avgRuntime: string;
  minRuntime: string;
  maxRuntime: string;
  comparisons: number;
  interchanges: number;
}

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
    // Placeholder -- will be wired to SortingService later
    console.log('Running comparison with:', {
      algorithms: this.selectedAlgorithms,
      arrayType: this.arrayType,
      arraySize: this.arraySize,
      numberOfRuns: this.numberOfRuns,
      file: this.selectedFile?.name,
    });
  }

  clearResults(): void {
    this.results = [];
  }
}
