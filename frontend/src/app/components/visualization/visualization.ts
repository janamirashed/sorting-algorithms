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

// Merge tree types
interface MergeTreeNode {
  id: string;
  left: number;
  right: number;
  values: number[];
  x: number;
  y: number;
  width: number;
  state: 'idle' | 'splitting' | 'merging-left' | 'merging-right' | 'merged';
  children: [MergeTreeNode | null, MergeTreeNode | null];
}

interface MergeTreeEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active: boolean;
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

  // Tree visualization (heap sort)
  treeNodes: TreeNode[] = [];
  treeEdges: TreeEdge[] = [];
  treeSvgWidth: number = 800;
  treeSvgHeight: number = 400;
  nodeRadius: number = 22;

  // Merge sort tree visualization
  mergeTreeRoot: MergeTreeNode | null = null;
  mergeTreeNodes: MergeTreeNode[] = [];
  mergeTreeEdges: MergeTreeEdge[] = [];
  mergeSvgWidth: number = 900;
  mergeSvgHeight: number = 500;
  mergeNodeHeight: number = 36;
  mergeCellWidth: number = 32;

  // Current merge state
  mergeRangeStart: number = -1;
  mergeRangeEnd: number = -1;
  midPoint: number = -1;
  leftPointer: number = -1;
  rightPointer: number = -1;
  writePointer: number = -1;

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

  get isMergeSort(): boolean {
    return this.selectedAlgorithm === 'Merge Sort';
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

    // Reset merge sort state
    this.mergeRangeStart = -1;
    this.mergeRangeEnd = -1;
    this.midPoint = -1;
    this.leftPointer = -1;
    this.rightPointer = -1;
    this.writePointer = -1;

    if (this.isHeapSort) {
      this.computeTreeLayout();
    }

    if (this.isMergeSort) {
      this.buildMergeTree();
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
            // Merge sort fields
            mergeRangeStart: step.mergeRangeStart,
            mergeRangeEnd: step.mergeRangeEnd,
            midPoint: step.midPoint,
            leftPointer: step.leftPointer,
            rightPointer: step.rightPointer,
            writePointer: step.writePointer,
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

    // Merge sort: update merge state and tree
    if (this.isMergeSort) {
      this.mergeRangeStart = step.mergeRangeStart ?? -1;
      this.mergeRangeEnd = step.mergeRangeEnd ?? -1;
      this.midPoint = step.midPoint ?? -1;
      this.leftPointer = step.leftPointer ?? -1;
      this.rightPointer = step.rightPointer ?? -1;
      this.writePointer = step.writePointer ?? -1;

      this.updateMergeTreeState();
    }

    this.cdr.detectChanges();
  }

  onReset(): void {
    this.subscription?.unsubscribe();
    this.isPlaying = false;
    this.isLoadingSteps = false;
    this.onGenerate();
  }

  // ─── Merge Sort Tree ─────────────────────────────────────────────────

  buildMergeTree(): void {
    if (this.array.length === 0) return;

    this.mergeTreeRoot = this.buildMergeTreeNode(0, this.array.length - 1);
    this.layoutMergeTree();
  }

  private buildMergeTreeNode(left: number, right: number): MergeTreeNode {
    const values = this.array.slice(left, right + 1);
    const node: MergeTreeNode = {
      id: `${left}-${right}`,
      left,
      right,
      values,
      x: 0,
      y: 0,
      width: 0,
      state: 'idle',
      children: [null, null],
    };

    if (left < right) {
      const mid = left + Math.floor((right - left) / 2);
      node.children[0] = this.buildMergeTreeNode(left, mid);
      node.children[1] = this.buildMergeTreeNode(mid + 1, right);
    }

    return node;
  }

  private layoutMergeTree(): void {
    if (!this.mergeTreeRoot) return;

    const depth = this.getMergeTreeDepth(this.mergeTreeRoot);
    const verticalSpacing = 80;
    const topPadding = 30;

    // Calculate cell size based on array length
    const n = this.array.length;
    if (n <= 8) {
      this.mergeCellWidth = 36;
    } else if (n <= 16) {
      this.mergeCellWidth = 30;
    } else if (n <= 32) {
      this.mergeCellWidth = 24;
    } else {
      this.mergeCellWidth = 18;
    }

    this.mergeNodeHeight = this.mergeCellWidth + 4;

    // Step 1: compute subtree widths bottom-up
    this.computeSubtreeWidth(this.mergeTreeRoot);

    this.mergeSvgWidth = Math.max(600, (this.mergeTreeRoot as any)._subtreeWidth + 60);
    this.mergeSvgHeight = depth * verticalSpacing + topPadding + 40;

    // Step 2: position nodes top-down using subtree widths
    this.mergeTreeNodes = [];
    this.mergeTreeEdges = [];

    this.positionMergeNode(this.mergeTreeRoot, 0, this.mergeSvgWidth / 2, topPadding, verticalSpacing);
  }

  /** Bottom-up: compute how much horizontal space each subtree needs */
  private computeSubtreeWidth(node: MergeTreeNode): number {
    const cellCount = node.right - node.left + 1;
    const nodeWidth = cellCount * this.mergeCellWidth + (cellCount - 1) * 2 + 12;

    if (!node.children[0] && !node.children[1]) {
      // Leaf — subtree width = this node's width
      (node as any)._subtreeWidth = nodeWidth;
      return nodeWidth;
    }

    const gap = 24;
    const leftSubtreeW = node.children[0] ? this.computeSubtreeWidth(node.children[0]) : 0;
    const rightSubtreeW = node.children[1] ? this.computeSubtreeWidth(node.children[1]) : 0;
    const childrenTotalW = leftSubtreeW + gap + rightSubtreeW;

    // Subtree width = max(this node's own width, children's combined width)
    (node as any)._subtreeWidth = Math.max(nodeWidth, childrenTotalW);
    return (node as any)._subtreeWidth;
  }

  private positionMergeNode(
    node: MergeTreeNode,
    level: number,
    centerX: number,
    y: number,
    verticalSpacing: number
  ): void {
    const cellCount = node.right - node.left + 1;
    node.width = cellCount * this.mergeCellWidth + (cellCount - 1) * 2 + 12;
    node.x = centerX - node.width / 2;
    node.y = y;

    this.mergeTreeNodes.push(node);

    const childY = y + verticalSpacing;

    if (node.children[0] && node.children[1]) {
      const leftChild = node.children[0];
      const rightChild = node.children[1];

      const gap = 24;
      const leftSubW: number = (leftChild as any)._subtreeWidth;
      const rightSubW: number = (rightChild as any)._subtreeWidth;
      const totalChildrenW = leftSubW + gap + rightSubW;

      // Center children within the parent's subtree space
      const leftCenterX = centerX - totalChildrenW / 2 + leftSubW / 2;
      const rightCenterX = centerX + totalChildrenW / 2 - rightSubW / 2;

      this.positionMergeNode(leftChild, level + 1, leftCenterX, childY, verticalSpacing);
      this.positionMergeNode(rightChild, level + 1, rightCenterX, childY, verticalSpacing);

      // Edges from parent to children
      const parentBottomY = node.y + this.mergeNodeHeight;
      this.mergeTreeEdges.push({
        x1: centerX,
        y1: parentBottomY,
        x2: leftCenterX,
        y2: childY,
        active: false,
      });
      this.mergeTreeEdges.push({
        x1: centerX,
        y1: parentBottomY,
        x2: rightCenterX,
        y2: childY,
        active: false,
      });
    }
  }

  private getMergeTreeDepth(node: MergeTreeNode): number {
    if (!node.children[0] && !node.children[1]) return 1;
    const leftDepth = node.children[0] ? this.getMergeTreeDepth(node.children[0]) : 0;
    const rightDepth = node.children[1] ? this.getMergeTreeDepth(node.children[1]) : 0;
    return 1 + Math.max(leftDepth, rightDepth);
  }

  private updateMergeTreeState(): void {
    if (!this.mergeTreeRoot) return;

    // Update values in all nodes from the current array state
    this.updateNodeValues(this.mergeTreeRoot);

    // Reset all node states
    this.resetMergeTreeState(this.mergeTreeRoot);

    // Mark edge activity
    for (const edge of this.mergeTreeEdges) {
      edge.active = false;
    }

    // If we have a merge range, highlight the relevant nodes
    if (this.mergeRangeStart >= 0 && this.mergeRangeEnd >= 0 && this.midPoint >= 0) {
      this.highlightMergeNodes(this.mergeTreeRoot);
    }

    // If complete, mark all nodes as merged
    if (this.isComplete) {
      this.markAllMerged(this.mergeTreeRoot);
    }
  }

  private updateNodeValues(node: MergeTreeNode): void {
    node.values = this.array.slice(node.left, node.right + 1);
    if (node.children[0]) this.updateNodeValues(node.children[0]);
    if (node.children[1]) this.updateNodeValues(node.children[1]);
  }

  private resetMergeTreeState(node: MergeTreeNode): void {
    node.state = 'idle';
    if (node.children[0]) this.resetMergeTreeState(node.children[0]);
    if (node.children[1]) this.resetMergeTreeState(node.children[1]);
  }

  private highlightMergeNodes(node: MergeTreeNode): void {
    // The parent node being merged into
    if (node.left === this.mergeRangeStart && node.right === this.mergeRangeEnd) {
      node.state = 'merging-left'; // parent is receiving merged elements
      // Highlight edges to this node's children
      for (const edge of this.mergeTreeEdges) {
        if (node.children[0] && node.children[1]) {
          const leftChild = node.children[0];
          const rightChild = node.children[1];
          const parentCenterX = node.x + node.width / 2;

          const leftCellCount = leftChild.right - leftChild.left + 1;
          const leftWidth = leftCellCount * this.mergeCellWidth + (leftCellCount - 1) * 2 + 12;
          const leftCenterX = leftChild.x + leftWidth / 2;

          const rightCellCount = rightChild.right - rightChild.left + 1;
          const rightWidth = rightCellCount * this.mergeCellWidth + (rightCellCount - 1) * 2 + 12;
          const rightCenterX = rightChild.x + rightWidth / 2;

          // Check if edge goes from this parent to either child
          if (Math.abs(edge.x1 - parentCenterX) < 2) {
            if (Math.abs(edge.x2 - leftCenterX) < 2 || Math.abs(edge.x2 - rightCenterX) < 2) {
              edge.active = true;
            }
          }
        }
      }
    }

    // Left child subarray
    if (node.left === this.mergeRangeStart && node.right === this.midPoint) {
      node.state = 'merging-left';
    }

    // Right child subarray
    if (node.left === this.midPoint + 1 && node.right === this.mergeRangeEnd) {
      node.state = 'merging-right';
    }

    if (node.children[0]) this.highlightMergeNodes(node.children[0]);
    if (node.children[1]) this.highlightMergeNodes(node.children[1]);
  }

  private markAllMerged(node: MergeTreeNode): void {
    node.state = 'merged';
    if (node.children[0]) this.markAllMerged(node.children[0]);
    if (node.children[1]) this.markAllMerged(node.children[1]);
  }

  // Helper to check if an index is the left pointer
  isMergeLeftPointer(globalIndex: number): boolean {
    return this.leftPointer >= 0 && globalIndex === this.leftPointer;
  }

  // Helper to check if an index is the right pointer
  isMergeRightPointer(globalIndex: number): boolean {
    return this.rightPointer >= 0 && globalIndex === this.rightPointer;
  }

  // Helper to check if an index is the write pointer
  isMergeWritePointer(globalIndex: number): boolean {
    return this.writePointer >= 0 && globalIndex === this.writePointer;
  }

  // Check if an index is in the current merge range
  isInMergeRange(index: number): boolean {
    return this.mergeRangeStart >= 0 && index >= this.mergeRangeStart && index <= this.mergeRangeEnd;
  }

  // Check if an index is in the left half of the merge
  isInLeftHalf(index: number): boolean {
    return this.mergeRangeStart >= 0 && this.midPoint >= 0 &&
      index >= this.mergeRangeStart && index <= this.midPoint;
  }

  // Check if an index is in the right half of the merge
  isInRightHalf(index: number): boolean {
    return this.midPoint >= 0 && this.mergeRangeEnd >= 0 &&
      index > this.midPoint && index <= this.mergeRangeEnd;
  }

  // Get CSS class for a merge tree node
  getMergeNodeClass(node: MergeTreeNode): string {
    const classes = ['merge-tree-node-box'];
    if (node.state !== 'idle') {
      classes.push('merge-' + node.state);
    }
    return classes.join(' ');
  }

  // Get CSS class for a cell inside a merge tree node
  getMergeCellClass(node: MergeTreeNode, localIndex: number): string {
    const globalIndex = node.left + localIndex;
    const classes = ['merge-cell'];

    if (this.isMergeWritePointer(globalIndex) && node.left === this.mergeRangeStart && node.right === this.mergeRangeEnd) {
      classes.push('write-target');
    } else if (this.isMergeLeftPointer(globalIndex)) {
      classes.push('left-pointer');
    } else if (this.isMergeRightPointer(globalIndex)) {
      classes.push('right-pointer');
    }

    return classes.join(' ');
  }

  // ─── Heap Sort Tree Layout Computation ───────────────────────────────

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
