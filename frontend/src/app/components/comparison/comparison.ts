import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
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
  selectedFiles: File[] = [];
  results: ComparisonResult[] = [];
  chartImages: { [key: string]: string } = {};
  isGeneratingCharts: boolean = false;

  constructor(private sortingService: SortingService, private cdr: ChangeDetectorRef) { }

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
      this.selectedFiles = Array.from(input.files);
    }
  }

  getFileNames(): string {
    return this.selectedFiles.map(f => f.name).join(', ');
  }

  runComparison(): void {
    if (this.selectedFiles.length > 0) {
      this.sortingService.compareWithFiles(
        this.selectedFiles,
        this.selectedAlgorithms,
        this.numberOfRuns
      ).subscribe({
        next: data => {
          this.results = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Comparison failed:', err),
      });
    } else {
      this.sortingService.compare({
        algorithmNames: this.selectedAlgorithms,
        arraySize: this.arraySize,
        generationMode: this.arrayType,
        numberOfRuns: this.numberOfRuns,
      }).subscribe({
        next: data => {
          this.results = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Comparison failed:', err),
      });
    }
  }

  clearResults(): void {
    this.results = [];
    this.selectedFiles = [];
    this.chartImages = {};
  }

  generateCharts(): void {
    if (this.results.length === 0) return;
    this.isGeneratingCharts = true;

    this.sortingService.generateCharts(this.results).subscribe({
      next: (charts) => {
        this.chartImages = charts;
        this.isGeneratingCharts = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Chart generation failed:', err);
        this.isGeneratingCharts = false;
        this.cdr.detectChanges();
      },
    });
  }

  exportCsv(): void {
    if (this.results.length === 0) return;

    const headers = [
      'Algorithm',
      'Array Size',
      'Generation Mode',
      'Number of Runs',
      'Avg Runtime',
      'Min Runtime',
      'Max Runtime',
      'Comparisons',
      'Interchanges',
    ];

    const rows = this.results.map(r => [
      r.algorithmName,
      r.arraySize,
      r.generationMode,
      r.numberOfRuns,
      r.avgRuntime,
      r.minRuntime,
      r.maxRuntime,
      r.comparisons,
      r.interchanges,
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'sorting_comparison.csv';
    link.click();

    URL.revokeObjectURL(url);
  }
}
