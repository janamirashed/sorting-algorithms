import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SortingService } from '../../services/sorting.service';
import { SortingStep } from '../../models/sorting-step.model';

interface TreeNode {
  index: number;
  value: number;
  x: number;
  y: number;
}

interface TreeEdge {
  from: number;
  to: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

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
  currentHeapSize: number = 0;

  currentStep: number = 0;
  totalSteps: number = 0;
  totalComparisons: number = 0;
  totalInterchanges: number = 0;

  comparingIndices: number[] = [];
  swappingIndices: number[] = [];
  sortedIndices: number[] = [];

  // Tree visualization
  treeNodes: TreeNode[] = [];
  treeEdges: TreeEdge[] = [];
  treeSvgWidth: number = 800;
  treeSvgHeight: number = 400;
  nodeRadius: number = 22;

  // Step-through state
  private steps: SortingStep[] = [];
  private stepIndex: number = -1;
  private stepsLoaded: boolean = false;
  private isLoadingSteps: boolean = false;

  private subscription: Subscription | null = null;
  constructor(private sortingService: SortingService, private cdr: ChangeDetectorRef) { }

  get isHeapSort(): boolean {
    return this.selectedAlgorithm === 'Heap Sort';
  }

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
    this.currentHeapSize = this.array.length;

    if (this.isHeapSort) {
      this.computeTreeLayout();
    }
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

    // Backend calculates delay = Math.max(1, 101 - speed)
    // To make the visualization slower (up to 1000ms delay), we send negative speed values.
    // targetDelay ranges from 1000ms (slider=1) to 10ms (slider=100)
    const targetDelay = 1000 - (this.speed - 1) * 10;
    const backendSpeed = 101 - targetDelay;

    this.subscription = this.sortingService
      .streamVisualization(this.selectedAlgorithm, this.arraySize, this.arrayType, backendSpeed, this.array)
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
      if (this.isHeapSort) {
        this.currentHeapSize = 0;
      }
    }

    if (this.isHeapSort) {
      if (!this.isComplete && this.comparingIndices.length > 0 && this.swappingIndices.length > 0) {
        const cIdx = this.comparingIndices[0];
        const sIdx = this.swappingIndices[0];

        // An extraction swap replaces root (0) with the end of the heap (currentHeapSize - 1).
        // For a max heap, the extracted root is the maximum, so array[sIdx] >= array[0] after swap.
        if (cIdx === 0 && sIdx > 0 && sIdx === this.currentHeapSize - 1) {
          if (this.array[sIdx] >= this.array[0]) {
            this.currentHeapSize = sIdx;
          }
        }
      }

      this.sortedIndices = [];
      for (let i = this.currentHeapSize; i < this.array.length; i++) {
        this.sortedIndices.push(i);
      }

      this.computeTreeLayout();
    }

    this.cdr.detectChanges();
  }

  onReset(): void {
    this.subscription?.unsubscribe();
    this.isPlaying = false;
    this.isLoadingSteps = false;
    this.onGenerate();
  }

  // ─── Tree Layout Computation ───────────────────────────────────────────

  computeTreeLayout(): void {
    const totalN = this.array.length;
    const n = this.currentHeapSize;
    if (totalN === 0) return;

    const depth = Math.floor(Math.log2(totalN)) + 1;
    const verticalSpacing = 70;
    const topPadding = 40;

    // Adaptive node radius based on total array size
    if (totalN <= 7) {
      this.nodeRadius = 26;
    } else if (totalN <= 15) {
      this.nodeRadius = 22;
    } else if (totalN <= 31) {
      this.nodeRadius = 18;
    } else {
      this.nodeRadius = 14;
    }

    // Calculate required width based on bottom level of full tree
    const maxNodesInLastLevel = Math.pow(2, depth - 1);
    const minNodeSpacing = this.nodeRadius * 2.5;
    const requiredWidth = Math.max(600, maxNodesInLastLevel * minNodeSpacing + 60);

    // Keep SVG dimensions fixed regardless of currentHeapSize to prevent jumpiness
    this.treeSvgWidth = requiredWidth;
    this.treeSvgHeight = depth * verticalSpacing + topPadding + 30;

    this.treeNodes = [];
    this.treeEdges = [];

    if (n === 0) return;

    // Compute positions level by level
    for (let i = 0; i < n; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const indexInLevel = i - (Math.pow(2, level) - 1);
      const nodesInLevel = Math.min(Math.pow(2, level), n - (Math.pow(2, level) - 1));
      const totalPossibleInLevel = Math.pow(2, level);

      // Position nodes evenly based on their binary tree position
      const x = ((indexInLevel + 0.5) / totalPossibleInLevel) * (this.treeSvgWidth - 40) + 20;
      const y = level * verticalSpacing + topPadding;

      this.treeNodes.push({
        index: i,
        value: this.array[i],
        x,
        y,
      });

      // Add edge from parent to this node
      if (i > 0) {
        const parentIndex = Math.floor((i - 1) / 2);
        const parentNode = this.treeNodes[parentIndex];
        this.treeEdges.push({
          from: parentIndex,
          to: i,
          x1: parentNode.x,
          y1: parentNode.y,
          x2: x,
          y2: y,
        });
      }
    }
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
