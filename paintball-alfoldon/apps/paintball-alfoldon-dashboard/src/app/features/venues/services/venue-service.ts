import { Service, computed, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminVenue, VenueBlock, VenueSettings } from '../models/venue';
import { VenueStore } from '../store/venue-store';

/** Pályák: active switch, travel / setup / teardown minutes and blocks. */
@Service()
export class VenueService {
  private store = inject(VenueStore);

  readonly venues = computed(() => this.store.venues());
  readonly venuesLoading = computed(() => this.store.venuesLoading());
  readonly venuesError = computed(() => this.store.venuesError());
  readonly blocks = computed(() => this.store.blocks());
  readonly blocksError = computed(() => this.store.blocksError());

  /**
   * Loads every venue with its dashboard settings.
   *
   * @returns void
   */
  loadVenues() {
    this.store.loadVenues();
  }

  /**
   * Saves the settings of one venue.
   *
   * @param id The ID of the venue.
   * @param settings Active flag and the travel, setup and teardown minutes.
   * @returns An Observable of the updated venue.
   */
  updateVenue(id: number, settings: VenueSettings): Observable<AdminVenue> {
    return this.store.updateVenue(id, settings);
  }

  /**
   * Loads the blocks (closed periods) of one venue.
   *
   * @param venueId The ID of the venue.
   * @returns void
   */
  loadBlocks(venueId: number) {
    this.store.loadBlocks(venueId);
  }

  /**
   * Adds a block: nobody can book the venue in this period.
   *
   * @param venueId The ID of the venue.
   * @param block Start, end and an optional reason.
   * @returns An Observable of the saved block.
   */
  addBlock(venueId: number, block: Omit<VenueBlock, 'id'>): Observable<VenueBlock> {
    return this.store.addBlock(venueId, block);
  }

  /**
   * Deletes a block.
   *
   * @param venueId The ID of the venue.
   * @param blockId The ID of the block.
   * @returns An Observable that completes when the block is deleted.
   */
  deleteBlock(venueId: number, blockId: number): Observable<void> {
    return this.store.deleteBlock(venueId, blockId);
  }
}
