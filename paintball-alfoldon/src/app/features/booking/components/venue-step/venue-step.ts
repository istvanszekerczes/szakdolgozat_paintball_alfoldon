import { Component, input, output } from '@angular/core';
import { Venue } from '../../models/booking';

@Component({
  selector: 'app-venue-step',
  templateUrl: './venue-step.html',
  styleUrl: './venue-step.scss',
})
export class VenueStep {
  readonly venues = input.required<Venue[]>();
  readonly selected = input<string>('');
  readonly picked = output<string>();
}
