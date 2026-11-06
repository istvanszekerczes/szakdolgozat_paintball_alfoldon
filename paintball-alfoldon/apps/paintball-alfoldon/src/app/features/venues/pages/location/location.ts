import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VenueMap } from '../../components/venue-map/venue-map';
import { directionsUrl } from '../../map/map-core';
import { PaintballLocation } from '../../models/paintball-location';
import { LocationService } from '../../services/location-service';

@Component({
  selector: 'app-location',
  imports: [RouterLink, VenueMap],
  templateUrl: './location.html',
  styleUrl: './location.scss',
})
export class LocationPage implements OnInit {
  private route = inject(ActivatedRoute);
  private locationService = inject(LocationService);
  private title = inject(Title);
  private meta = inject(Meta);
  private destroyRef = inject(DestroyRef);

  readonly location = signal<PaintballLocation | null>(null);
  readonly fieldType = LocationService.fieldType;

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      const loc = this.locationService.getLocationById(data['id']);
      if (!loc) return;
      this.location.set(loc);
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
