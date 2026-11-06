import { Component, inject } from '@angular/core';
import { syncPageMeta } from '../../../../core/i18n/page-meta';
import { TranslatePipe } from '../../../../core/i18n/translate-pipe';
import { TranslationService } from '../../../../core/i18n/translation-service';

@Component({
  selector: 'app-contact',
  imports: [TranslatePipe],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private translationService = inject(TranslationService);

  constructor() {
    const t = (key: string, params?: Record<string, string>) =>
      this.translationService.translate(key, params);
    syncPageMeta(
      () => t('common.titleSuffix', { title: t('contact.metaTitle') }),
      () => t('contact.metaDescription'),
    );
  }
}
