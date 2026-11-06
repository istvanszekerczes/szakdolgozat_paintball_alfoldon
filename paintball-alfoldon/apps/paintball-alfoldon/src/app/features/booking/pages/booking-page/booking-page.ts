import { Component, inject } from '@angular/core';
import { syncPageMeta } from '../../../../core/i18n/page-meta';
import { TranslatePipe } from '../../../../core/i18n/translate-pipe';
import { TranslationService } from '../../../../core/i18n/translation-service';
import { BookingWizard } from '../../components/booking-wizard/booking-wizard';

@Component({
  selector: 'app-booking-page',
  imports: [BookingWizard, TranslatePipe],
  templateUrl: './booking-page.html',
  styleUrl: './booking-page.scss',
})
export class BookingPage {
  private translationService = inject(TranslationService);

  constructor() {
    const t = (key: string, params?: Record<string, string>) =>
      this.translationService.translate(key, params);
    syncPageMeta(
      () => t('common.titleSuffix', { title: t('booking.metaTitle') }),
      () => t('booking.metaDescription'),
    );
  }
}
