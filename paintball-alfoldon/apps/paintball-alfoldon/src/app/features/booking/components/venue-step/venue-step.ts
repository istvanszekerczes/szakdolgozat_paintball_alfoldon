import { Component, inject, input, output } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate-pipe';
import { TranslationService } from '../../../../core/i18n/translation-service';
import { Venue } from '../../models/booking';

@Component({
  selector: 'app-venue-step',
  imports: [TranslatePipe],
  templateUrl: './venue-step.html',
  styleUrl: './venue-step.scss',
})
export class VenueStep {
  private translationService = inject(TranslationService);

  readonly venues = input.required<Venue[]>();
  readonly selected = input<string>('');
  readonly picked = output<string>();

  /** The site's translation of the venue name; the backend's name for a venue it does not know. */
  protected venueName(venue: Venue): string {
    return this.translationService.translateOr(`venues.${venue.slug}.venue`, venue.name);
  }
}
