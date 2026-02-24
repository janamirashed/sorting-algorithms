export interface SortingStep {
  array: number[];
  comparingIndcies: number;
  swappingIndcies: number;
  sortedIndcies: number[];
  stepNumber: number;
  totalComparisons: number;
  totalInterchanges: number;
  isComplete: boolean;
}
