import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  arraySize: number = 30;
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
    this.isPlaying = !this.isPlaying;
    // Placeholder -- will be wired to SSE visualization stream
    console.log(this.isPlaying ? 'Playing' : 'Paused', {
      algorithm: this.selectedAlgorithm,
      speed: this.speed,
    });
  }

  onStepForward(): void {
    // placeholder -- will step through sorting via service
    console.log('Step forward');
  }

  onReset(): void {
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
