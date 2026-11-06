import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { syncPageMeta } from '../../../../core/i18n/page-meta';
import { TranslatePipe } from '../../../../core/i18n/translate-pipe';
import { TranslationService } from '../../../../core/i18n/translation-service';

@Component({
  selector: 'app-about',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  private translationService = inject(TranslationService);

  constructor() {
    const t = (key: string, params?: Record<string, string>) =>
      this.translationService.translate(key, params);
    syncPageMeta(
      () => t('common.titleSuffix', { title: t('about.metaTitle') }),
      () => t('about.metaDescription'),
    );
  }
}
