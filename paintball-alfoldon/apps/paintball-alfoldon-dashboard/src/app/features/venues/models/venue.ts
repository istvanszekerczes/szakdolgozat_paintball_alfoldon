/** Venues and venue blocks on the dashboard (see AdminVenueController.java). */
export interface AdminVenue {
  id: number;
  slug: string;
  city: string;
  name: string;
  indoor: boolean;
  address: string;
  minHeadcount: number;
  maxHeadcount: number;
  active: boolean;
  travelMinutes: number;
  setupMinutes: number;
  teardownMinutes: number;
}

export interface VenueBlock {
  id: number;
  /** Local date-time, e.g. 2026-11-10T09:00:00 */
  startsAt: string;
  endsAt: string;
  reason: string | null;
}

/** The part of a venue the dashboard can change. */
export type VenueSettings = Pick<
  AdminVenue,
  'active' | 'travelMinutes' | 'setupMinutes' | 'teardownMinutes'
>;
