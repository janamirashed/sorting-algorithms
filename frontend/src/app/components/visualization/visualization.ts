import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SortingService } from '../../services/sorting.service';
import { SortingStep } from '../../models/sorting-step.model';

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

  // Step-through state
  private steps: SortingStep[] = [];
  private stepIndex: number = -1;
  private stepsLoaded: boolean = false;
  private isLoadingSteps: boolean = false;

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
    this.steps = [];
    this.stepIndex = -1;
    this.stepsLoaded = false;
    this.isLoadingSteps = false;
  }

  onPlayPause(): void {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.subscription?.unsubscribe();
      return;
    }
    this.isPlaying = true;
    // Clear any cached steps from step-through mode
    this.steps = [];
    this.stepIndex = -1;
    this.stepsLoaded = false;
    this.isLoadingSteps = false;

    this.subscription = this.sortingService
      .streamVisualization(this.selectedAlgorithm, this.arraySize, this.arrayType, this.speed, this.array)
      .subscribe({
        next: (step) => {
          this.applyStep(step);
        },
        complete: () => {
          this.isPlaying = false;
          this.cdr.detectChanges();
        },
      });
  }

  onStepForward(): void {
    // If steps haven't been fetched yet, start loading them
    if (!this.stepsLoaded && !this.isLoadingSteps) {
      this.loadAllSteps();
      return;
    }

    // Advance to the next cached step
    if (this.stepIndex < this.steps.length - 1) {
      this.stepIndex++;
      this.applyStep(this.steps[this.stepIndex]);
    }
  }

  private loadAllSteps(): void {
    this.isLoadingSteps = true;
    this.steps = [];
    this.stepIndex = -1;

    this.subscription = this.sortingService
      .streamVisualization(this.selectedAlgorithm, this.arraySize, this.arrayType, 100, this.array)
      .subscribe({
        next: (step) => {
          const processed: SortingStep = {
            array: step.array,
            comparingIndices: step.comparingIndices,
            swappingIndices: step.swappingIndices,
            sortedIndices: step.sortedIndices ?? [],
            stepNumber: step.stepNumber,
            totalComparisons: step.totalComparisons,
            totalInterchanges: step.totalInterchanges,
            isComplete: (step as any).complete || step.isComplete,
          };
          this.steps.push(processed);

          // Show the first step immediately
          if (this.steps.length === 1 && this.stepIndex === -1) {
            this.stepIndex = 0;
            this.applyStep(processed);
          }
        },
        complete: () => {
          this.stepsLoaded = true;
          this.isLoadingSteps = false;
          this.cdr.detectChanges();
        },
      });
  }

  private applyStep(step: SortingStep): void {
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
  }

  onReset(): void {
    this.subscription?.unsubscribe();
    this.isPlaying = false;
    this.isLoadingSteps = false;
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
