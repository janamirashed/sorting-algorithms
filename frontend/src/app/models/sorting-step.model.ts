export interface SortingStep {
  array: number[];
  comparingIndices: number;
  swappingIndices: number;
  sortedIndices: number[];
  stepNumber: number;
  totalComparisons: number;
  totalInterchanges: number;
  isComplete: boolean;

  // Merge sort specific fields
  mergeRangeStart?: number;
  mergeRangeEnd?: number;
  midPoint?: number;
  leftPointer?: number;
  rightPointer?: number;
  writePointer?: number;
}
