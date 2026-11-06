/**
 * One paintball venue as the site shows it: route slug, texts for the page and the map position.
 */
export interface PaintballLocation {
  /** Route slug, e.g. `szeged-csarnok`. */
  id: string;
  /** City the venue belongs to — used as the primary label everywhere. */
  city: string;
  /** Short venue name that disambiguates cities with several fields. */
  venue: string;
  /** Covered (indoor) field vs. open-air field. */
  indoor: boolean;
  title: string;
  metaDesc: string;
  address: string;
  terrainType: string;
  detailedDescription: string;
  minHeadcount: number;
  optHeadcount: string;
  maxHeadcount: number;
  extraActivities: string[];
  lat: number;
  lng: number;
}
