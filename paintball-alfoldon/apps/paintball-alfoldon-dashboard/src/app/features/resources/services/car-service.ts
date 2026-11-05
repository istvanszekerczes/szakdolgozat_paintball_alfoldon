import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../shared/utils/error-message';
import { Car, CarInput } from '../../bookings/models/booking';

@Injectable({ providedIn: 'root' })
export class CarsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_URL)}/api/admin/cars`;

  list(): Observable<Car[]> {
    return this.http.get<Car[]>(this.base);
  }

  create(input: CarInput): Observable<Car> {
    return this.http.post<Car>(this.base, input);
  }

  update(id: number, input: CarInput): Observable<Car> {
    return this.http.put<Car>(`${this.base}/${id}`, input);
  }
}
