import { inject } from '@angular/core';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, pipe, switchMap, tap } from 'rxjs';
import { BackendCommunicator } from '../../../core/services/backend-communicator';
import { errorMessage } from '../../../shared/utils/error-message';
import { AdminVenue, VenueBlock, VenueSettings } from '../models/venue';

type VenueState = {
  venues: AdminVenue[];
  venuesLoading: boolean;
  venuesError: string | null;
  /** Blocks of the venue whose dialog is open, earliest first. */
  blocks: VenueBlock[];
  blocksError: string | null;
};

const initialState: VenueState = {
  venues: [],
  venuesLoading: false,
  venuesError: null,
  blocks: [],
  blocksError: null,
};

export const VenueStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withDevtools('venues'),
  withProps(() => ({
    backendCommunicator: inject(BackendCommunicator),
  })),
  withMethods(({ backendCommunicator, ...store }) => ({
    loadVenues: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { venuesLoading: true })),
        switchMap(() =>
          backendCommunicator.loadVenues().pipe(
            tapResponse({
              next: (venues) => patchState(store, { venues, venuesLoading: false }),
              error: (err) =>
                patchState(store, { venuesLoading: false, venuesError: errorMessage(err) }),
            }),
          ),
        ),
      ),
    ),

    updateVenue(id: number, settings: VenueSettings): Observable<AdminVenue> {
      return backendCommunicator.updateVenue(id, settings).pipe(
        tap((updated) =>
          patchState(store, (state) => ({
            venues: state.venues.map((v) => (v.id === updated.id ? updated : v)),
          })),
        ),
      );
    },

    loadBlocks: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { blocks: [], blocksError: null })),
        switchMap((venueId) =>
          backendCommunicator.loadVenueBlocks(venueId).pipe(
            tapResponse({
              next: (blocks) => patchState(store, { blocks }),
              error: (err) => patchState(store, { blocksError: errorMessage(err) }),
            }),
          ),
        ),
      ),
    ),

    addBlock(venueId: number, block: Omit<VenueBlock, 'id'>): Observable<VenueBlock> {
      return backendCommunicator.addVenueBlock(venueId, block).pipe(
        tap((added) =>
          patchState(store, (state) => ({
            blocks: [...state.blocks, added].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
          })),
        ),
      );
    },

    deleteBlock(venueId: number, blockId: number): Observable<void> {
      return backendCommunicator
        .deleteVenueBlock(venueId, blockId)
        .pipe(
          tap(() =>
            patchState(store, (state) => ({
              blocks: state.blocks.filter((b) => b.id !== blockId),
            })),
          ),
        );
    },
  })),
);
