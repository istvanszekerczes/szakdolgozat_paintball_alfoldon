import { Component, inject } from '@angular/core';
import { Gallery } from '../../../../shared/components/gallery/gallery';
import { syncPageMeta } from '../../../../core/i18n/page-meta';
import { TranslatePipe } from '../../../../core/i18n/translate-pipe';
import { TranslationService } from '../../../../core/i18n/translation-service';

@Component({
  selector: 'app-gallery-page',
  imports: [Gallery, TranslatePipe],
  templateUrl: './gallery-page.html',
  styleUrl: './gallery-page.scss',
})
export class GalleryPage {
  private translationService = inject(TranslationService);

  constructor() {
    const t = (key: string, params?: Record<string, string>) =>
      this.translationService.translate(key, params);
    syncPageMeta(
      () => t('common.titleSuffix', { title: t('gallery.metaTitle') }),
      () => t('gallery.metaDescription'),
    );
  }
}
