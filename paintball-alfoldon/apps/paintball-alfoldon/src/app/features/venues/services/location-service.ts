import { Service, Signal, computed, inject } from '@angular/core';
import { TranslationKey, TranslationService } from '../../../core/i18n/translation-service';
import { ActivityKey, PaintballLocation } from '../models/paintball-location';

/** The language-independent part of a venue; its texts live in the language files (`venues.<id>`). */
type VenueData = Omit<
  PaintballLocation,
  | 'venue'
  | 'title'
  | 'metaDesc'
  | 'address'
  | 'terrainType'
  | 'detailedDescription'
  | 'extraActivities'
> & { extraActivities: ActivityKey[] };

/** The seven venues. Static data: the site needs it at build time for prerendering, without the backend. */
const VENUES: VenueData[] = [
  {
    id: 'szeged',
    city: 'Szeged',
    indoor: false,
    minHeadcount: 10,
    optHeadcount: '24–100',
    maxHeadcount: 150,
    extraActivities: ['airsoft', 'laserTag', 'archeryTag'],
    lat: 46.232385,
    lng: 20.143227,
  },
  {
    id: 'szeged-csarnok',
    city: 'Szeged',
    indoor: true,
    minHeadcount: 8,
    optHeadcount: '12–80',
    maxHeadcount: 100,
    extraActivities: ['airsoft', 'laserTag'],
    lat: 46.234412,
    lng: 20.138107,
  },
  {
    id: 'szentes',
    city: 'Szentes',
    indoor: false,
    minHeadcount: 10,
    optHeadcount: '10–50',
    maxHeadcount: 100,
    extraActivities: ['laserTag', 'bubbleFootball'],
    lat: 46.662945,
    lng: 20.280217,
  },
  {
    id: 'szolnok',
    city: 'Szolnok',
    indoor: true,
    minHeadcount: 10,
    optHeadcount: '20–150',
    maxHeadcount: 300,
    extraActivities: ['laserTag', 'archeryTag', 'waterFootball', 'bouncyCastle'],
    lat: 47.162229,
    lng: 20.186734,
  },
  {
    id: 'kecskemet',
    city: 'Kecskemét',
    indoor: true,
    minHeadcount: 10,
    optHeadcount: '20–100',
    maxHeadcount: 150,
    extraActivities: ['airsoft', 'laserTag', 'archeryTag'],
    lat: 46.887551,
    lng: 19.64628,
  },
  {
    id: 'bekescsaba',
    city: 'Békéscsaba',
    indoor: false,
    minHeadcount: 10,
    optHeadcount: '12–80',
    maxHeadcount: 120,
    extraActivities: ['laserTag', 'bubbleFootball', 'archeryTag'],
    lat: 46.684613,
    lng: 21.194293,
  },
  {
    id: 'oroshaza',
    city: 'Orosháza',
    indoor: false,
    minHeadcount: 10,
    optHeadcount: '12–120',
    maxHeadcount: 150, // Technical max in a typical game group; event capacity is 1000+
    extraActivities: ['laserTag', 'archeryTag', 'bubbleFootball'],
    lat: 46.564047,
    lng: 20.64386,
  },
];

/** The venues with the texts of their pages, in the current language. */
@Service()
export class LocationService {
  private translationService = inject(TranslationService);

  /** Every venue in the order the site lists them; follows language switches. */
  readonly locations: Signal<PaintballLocation[]> = computed(() => {
    const t = (key: string) => this.translationService.translate(key);
    return VENUES.map((data) => ({
      ...data,
      venue: t(`venues.${data.id}.venue`),
      title: t(`venues.${data.id}.title`),
      metaDesc: t(`venues.${data.id}.metaDesc`),
      address: t(`venues.${data.id}.address`),
      terrainType: t(`venues.${data.id}.terrainType`),
      detailedDescription: t(`venues.${data.id}.description`),
      extraActivities: data.extraActivities.map((key) => t(`activities.${key}.tag`)),
    }));
  });

  /**
   * Returns every venue, in the order the site lists them, in the current language.
   * Use `locations` where the texts must follow a language switch.
   *
   * @returns The list of venues.
   */
  getLocations(): PaintballLocation[] {
    return this.locations();
  }

  /**
   * Returns the smallest and the largest group any venue takes.
   *
   * @returns The overall minimum and maximum headcount.
   */
  getGroupRange(): { min: number; max: number } {
    return {
      min: Math.min(...VENUES.map((l) => l.minHeadcount)),
      max: Math.max(...VENUES.map((l) => l.maxHeadcount)),
    };
  }

  /**
   * Finds a venue by its route slug. Reactive: called inside a `computed`, it follows language
   * switches.
   *
   * @param id The slug, e.g. `szeged-csarnok`.
   * @returns The venue, or undefined for an unknown slug.
   */
  getLocationById(id: string): PaintballLocation | undefined {
    return this.locations().find((loc) => loc.id === id);
  }

  /**
   * Names the kind of field for labels.
   *
   * @param loc The venue.
   * @returns Translation key of `Fedett` for indoor, `Szabadtéri` for open-air venues.
   */
  static fieldType(loc: { indoor: boolean }): TranslationKey {
    return loc.indoor ? 'common.indoor' : 'common.outdoor';
  }
}
