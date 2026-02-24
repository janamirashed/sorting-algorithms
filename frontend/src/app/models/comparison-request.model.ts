export interface ComparisonRequest {
  algorithmNames: string[];
  arraySize: number;
  generationMode: string;
  numberOfRuns: number;
  file?: File;
}
