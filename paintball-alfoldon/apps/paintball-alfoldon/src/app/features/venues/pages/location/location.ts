import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { TranslatePipe } from '../../../../core/i18n/translate-pipe';
import { VenueMap } from '../../components/venue-map/venue-map';
import { directionsUrl } from '../../map/map-core';
import { PaintballLocation } from '../../models/paintball-location';
import { LocationService } from '../../services/location-service';

@Component({
  selector: 'app-location',
  imports: [RouterLink, VenueMap, TranslatePipe],
  templateUrl: './location.html',
  styleUrl: './location.scss',
})
export class LocationPage {
  private route = inject(ActivatedRoute);
  private locationService = inject(LocationService);
  private title = inject(Title);
  private meta = inject(Meta);

  /** Slug from the route data; route data can change without re-creating the page. */
  private readonly id = toSignal(this.route.data.pipe(map((data) => data['id'] as string)));

  /** The venue in the current language; follows language switches. */
  readonly location = computed(() => {
    const id = this.id();
    return id ? (this.locationService.getLocationById(id) ?? null) : null;
  });
  readonly fieldType = LocationService.fieldType;

  constructor() {
    effect(() => {
      const loc = this.location();
      if (!loc) return;
      this.title.setTitle(loc.title);
      this.meta.updateTag({ name: 'description', content: loc.metaDesc });
    });
  }

  directions(loc: PaintballLocation): string {
    return directionsUrl(loc);
  }

  coords(loc: PaintballLocation): string {
    return `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
  }
}
