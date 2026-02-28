export interface SortingStep {
  array: number[];
  comparingIndices: number;
  swappingIndices: number;
  sortedIndices: number[];
  stepNumber: number;
  totalComparisons: number;
  totalInterchanges: number;
  isComplete: boolean;
}
