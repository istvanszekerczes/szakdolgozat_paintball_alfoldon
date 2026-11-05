import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../shared/utils/error-message';
import { AdminVenue, VenueBlock } from '../../bookings/models/booking';

export type VenueSettings = Pick<AdminVenue, 'active' | 'travelMinutes' | 'setupMinutes' | 'teardownMinutes'>;

@Injectable({ providedIn: 'root' })
export class VenuesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_URL)}/api/admin/venues`;

  list(): Observable<AdminVenue[]> {
    return this.http.get<AdminVenue[]>(this.base);
  }

  update(id: number, settings: VenueSettings): Observable<AdminVenue> {
    return this.http.put<AdminVenue>(`${this.base}/${id}`, settings);
  }

  blocks(id: number): Observable<VenueBlock[]> {
    return this.http.get<VenueBlock[]>(`${this.base}/${id}/blocks`);
  }

  addBlock(id: number, block: Omit<VenueBlock, 'id'>): Observable<VenueBlock> {
    return this.http.post<VenueBlock>(`${this.base}/${id}/blocks`, block);
  }

  deleteBlock(id: number, blockId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/blocks/${blockId}`);
  }
}
