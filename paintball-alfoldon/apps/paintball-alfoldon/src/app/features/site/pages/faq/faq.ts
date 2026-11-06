import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Accordion } from '../../../../shared/components/accordion/accordion';
import { syncPageMeta } from '../../../../core/i18n/page-meta';
import { TranslatePipe } from '../../../../core/i18n/translate-pipe';
import { TranslationService } from '../../../../core/i18n/translation-service';

@Component({
  selector: 'app-faq-page',
  imports: [Accordion, RouterLink, TranslatePipe],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
})
export class Faq {
  private translationService = inject(TranslationService);

  /** Questions under `faq.items.<key>` in the language files. */
  readonly faqs = ['players', 'equipment', 'paint', 'environment', 'photos'];

  constructor() {
    const t = (key: string, params?: Record<string, string>) =>
      this.translationService.translate(key, params);
    syncPageMeta(
      () => t('common.titleSuffix', { title: t('faq.metaTitle') }),
      () => t('faq.metaDescription'),
    );
  }
}
