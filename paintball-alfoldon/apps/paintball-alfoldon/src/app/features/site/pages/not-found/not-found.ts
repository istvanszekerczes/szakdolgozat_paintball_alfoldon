import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { syncPageMeta } from '../../../../core/i18n/page-meta';
import { TranslatePipe } from '../../../../core/i18n/translate-pipe';
import { TranslationService } from '../../../../core/i18n/translation-service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound implements OnInit, OnDestroy {
  private meta = inject(Meta);
  private translationService = inject(TranslationService);

  constructor() {
    const t = (key: string, params?: Record<string, string>) =>
      this.translationService.translate(key, params);
    syncPageMeta(() => t('common.titleSuffix', { title: t('notFound.metaTitle') }));
  }

  ngOnInit(): void {
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }

  ngOnDestroy(): void {
    this.meta.removeTag('name="robots"');
  }
}
