import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { syncPageMeta } from '../../../../core/i18n/page-meta';
import { TranslatePipe } from '../../../../core/i18n/translate-pipe';
import { TranslationService } from '../../../../core/i18n/translation-service';
import { HungaryMap } from '../../../venues/components/hungary-map/hungary-map';
import { ActivityKey } from '../../../venues/models/paintball-location';
import { LocationService } from '../../../venues/services/location-service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, HungaryMap, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private translationService = inject(TranslationService);
  private locationService = inject(LocationService);
  readonly locations = this.locationService.locations;
  readonly groups = this.locationService.getGroupRange();
  readonly fieldType = LocationService.fieldType;

  /** Texts under `activities.<key>` in the language files. */
  readonly activities: ActivityKey[] = [
    'airsoft',
    'laserTag',
    'archeryTag',
    'bubbleFootball',
    'waterFootball',
    'bouncyCastle',
  ];

  /** Texts under `testimonials.<key>` in the language files. */
  readonly testimonials = ['teamBuilding', 'birthday'];

  constructor() {
    const t = (key: string) => this.translationService.translate(key);
    syncPageMeta(
      () => t('home.metaTitle'),
      () => t('home.metaDescription'),
    );
  }
}
