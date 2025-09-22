import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService, BudgetItem } from './data.service';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch data from backend when data is empty', () => {
    const mockData = {
      myBudget: [
        { title: 'Eat out', budget: 25 },
        { title: 'Rent', budget: 375 }
      ]
    };

    service.getBudgetData().subscribe((data: BudgetItem[]) => {
      expect(data.length).toBe(2);
      expect(data[0].title).toBe('Eat out');
      expect(data[0].budget).toBe(25);
    });

    const req = httpMock.expectOne('http://localhost:3000/budget');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should not make HTTP call if data is already loaded', () => {
    const mockData = {
      myBudget: [
        { title: 'Eat out', budget: 25 }
      ]
    };

    // First call should make HTTP request
    service.getBudgetData().subscribe();
    const req1 = httpMock.expectOne('http://localhost:3000/budget');
    req1.flush(mockData);

    // Second call should not make HTTP request
    service.getBudgetData().subscribe();
    httpMock.expectNone('http://localhost:3000/budget');
  });

  it('should check if data is loaded correctly', () => {
    expect(service.isDataLoaded()).toBeFalse();

    const mockData = {
      myBudget: [
        { title: 'Eat out', budget: 25 }
      ]
    };

    service.getBudgetData().subscribe();
    const req = httpMock.expectOne('http://localhost:3000/budget');
    req.flush(mockData);

    expect(service.isDataLoaded()).toBeTrue();
  });
});
