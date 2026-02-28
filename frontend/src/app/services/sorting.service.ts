import {Injectable, NgZone} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SortingStep} from '../models/sorting-step.model';
import {ComparisonResult} from '../models/comparison-result.model';
import {ComparisonRequest} from '../models/comparison-request.model';

@Injectable({
  providedIn: 'root',
})

export class SortingService {
  private baseUrl = "http://localhost:8080/api";

  constructor(private http: HttpClient, private zone: NgZone) {}

  compare(request: ComparisonRequest): Observable<ComparisonResult[]> {
    return this.http.post<ComparisonResult[]>(`${this.baseUrl}/compare`, {
      algorithmNames: request.algorithmNames,
      arraySize: request.arraySize,
      generationMode: request.generationMode,
      numberOfRuns: request.numberOfRuns,
    });
  }

  streamVisualization(
    algorithm: string,
    size: number,
    mode: string,
  ) : Observable<SortingStep> {
    return new Observable<SortingStep>((observer) => {
      const url = `${this.baseUrl}/visualize/${algorithm}?size=${size}&mode=${mode}`;
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
