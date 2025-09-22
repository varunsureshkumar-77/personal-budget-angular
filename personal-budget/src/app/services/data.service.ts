import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface BudgetItem {
  title: string;
  budget: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private budgetData: BudgetItem[] = [];
  private budgetDataSubject = new BehaviorSubject<BudgetItem[]>([]);
  public budgetData$ = this.budgetDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  getBudgetData(): Observable<BudgetItem[]> {
    // Only make HTTP call if data is empty
    if (this.budgetData.length === 0) {
      this.fetchBudgetFromBackend();
    }
    return this.budgetData$;
  }

  private fetchBudgetFromBackend(): void {
    this.http.get<{ myBudget: BudgetItem[] }>('http://localhost:3000/budget')
      .subscribe({
        next: (res) => {
          this.budgetData = res.myBudget;
          this.budgetDataSubject.next(this.budgetData);
        },
        error: (error) => {
          console.error('Error fetching budget data:', error);
        }
      });
  }

  // Method to check if data is already loaded
  isDataLoaded(): boolean {
    return this.budgetData.length > 0;
  }

  // Method to force refresh data if needed
  refreshData(): void {
    this.budgetData = [];
    this.fetchBudgetFromBackend();
  }
}
