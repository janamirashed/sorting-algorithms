import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SortingService } from '../../services/sorting.service';

@Component({
  selector: 'app-visualization',
  imports: [FormsModule],
  templateUrl: './visualization.html',
  styleUrl: './visualization.css',
})
export class Visualization {
  algorithms: string[] = [
    'Selection Sort',
    'Insertion Sort',
    'Bubble Sort',
    'Merge Sort',
    'Heap Sort',
    'Quick Sort',
  ];

  selectedAlgorithm: string = 'Bubble Sort';
  arraySize: number = 10;
  arrayType: string = 'RANDOM';
  speed: number = 50;
  manualInput: string = '';

  array: number[] = [];
  maxValue: number = 100;
  hasArray: boolean = false;
  isPlaying: boolean = false;
  isComplete: boolean = false;

  currentStep: number = 0;
  totalSteps: number = 0;
  totalComparisons: number = 0;
  totalInterchanges: number = 0;

  comparingIndices: number[] = [];
  swappingIndices: number[] = [];
  sortedIndices: number[] = [];

  private subscription: Subscription | null = null;
  constructor(private sortingService: SortingService, private cdr: ChangeDetectorRef) { }

  onGenerate(): void {
    if (this.manualInput.trim()) {
      this.array = this.manualInput
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));
    } else {
      this.array = this.generateArray(this.arraySize, this.arrayType);
    }
    this.maxValue = Math.max(...this.array, 1);
    this.hasArray = true;
    this.isComplete = false;
    this.currentStep = 0;
    this.totalSteps = 0;
    this.totalComparisons = 0;
    this.totalInterchanges = 0;
    this.comparingIndices = [];
    this.swappingIndices = [];
    this.sortedIndices = [];
  }

  onPlayPause(): void {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.subscription?.unsubscribe();
      return;
    }
    this.isPlaying = true;
    this.subscription = this.sortingService
      .streamVisualization(this.selectedAlgorithm, this.arraySize, this.arrayType, this.speed)
      .subscribe({
        next: (step) => {
          this.array = step.array;
          this.maxValue = Math.max(...this.array, 1);
          this.comparingIndices = step.comparingIndices != null ? [step.comparingIndices] : [];
          this.swappingIndices = step.swappingIndices != null ? [step.swappingIndices] : [];
          this.sortedIndices = step.sortedIndices ?? [];
          this.currentStep = step.stepNumber;
          this.totalComparisons = step.totalComparisons;
          this.totalInterchanges = step.totalInterchanges;
          // Jackson serializes Java boolean 'isComplete' as 'complete'
          if ((step as any).complete || step.isComplete) {
            this.isComplete = true;
            this.isPlaying = false;
          }
          this.cdr.detectChanges();
        },
        complete: () => {
          this.isPlaying = false;
          this.cdr.detectChanges();
        },
      });
  }

  onStepForward(): void {
    // placeholder -- will step through sorting via service
    console.log('Step forward');
  }

  onReset(): void {
    this.subscription?.unsubscribe();
    this.isPlaying = false;
    this.onGenerate();
  }

  private generateArray(size: number, type: string): number[] {
    const arr: number[] = [];
    for (let i = 1; i <= size; i++) {
      arr.push(i);
    }

    switch (type) {
      case 'SORTED':
        return arr;
      case 'INVERSELY_SORTED':
        return arr.reverse();
      case 'RANDOM':
      default:
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
  }
}
