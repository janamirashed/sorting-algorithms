import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SortingStep } from '../models/sorting-step.model';
import { ComparisonResult } from '../models/comparison-result.model';
import { ComparisonRequest } from '../models/comparison-request.model';

@Injectable({
  providedIn: 'root',
})

export class SortingService {
  private baseUrl = "http://localhost:8080/api";

  constructor(private http: HttpClient, private zone: NgZone) { }

  compare(request: ComparisonRequest): Observable<ComparisonResult[]> {
    return this.http.post<ComparisonResult[]>(`${this.baseUrl}/compare`, {
      algorithmNames: request.algorithmNames,
      arraySize: request.arraySize,
      generationMode: request.generationMode,
      numberOfRuns: request.numberOfRuns,
    });
  }

  compareWithFile(file: File, algorithmNames: string[], numberOfRuns: number):
    Observable<ComparisonResult[]> {
    const formData = new FormData()
    formData.append('file', file);
    algorithmNames.forEach(name => formData.append('algorithmNames', name));
    formData.append('numberOfRuns', numberOfRuns.toString());

    return this.http.post<ComparisonResult[]>(`${this.baseUrl}/compare/file`, formData);
  }

  generateCharts(results: ComparisonResult[]): Observable<{ [key: string]: string }> {
    return this.http.post<{ [key: string]: string }>(`${this.baseUrl}/compare/charts`, results);
  }

  streamVisualization(
    algorithm: string,
    size: number,
    mode: string,
    speed: number,
    customArray?: number[],
  ): Observable<SortingStep> {
    return new Observable<SortingStep>((observer) => {
      let url = `${this.baseUrl}/visualize/${algorithm}?size=${size}&mode=${mode}&speed=${speed}`;
      if (customArray && customArray.length > 0) {
        url += `&array=${customArray.join(',')}`;
      }
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        this.zone.run(() => {
          const step: SortingStep = JSON.parse(event.data);
          observer.next(step);
        });
      };

      eventSource.onerror = (event) => {
        this.zone.run(() => {
          eventSource.close();
          observer.complete();
        });
      };

      return () => {
        eventSource.close();
      };
    });
  }
}
