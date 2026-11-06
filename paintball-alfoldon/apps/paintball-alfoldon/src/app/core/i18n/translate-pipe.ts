import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationKey, TranslationParams, TranslationService } from './translation-service';

/**
 * `{{ 'header.home' | translate }}` or `{{ 'map.venueCount' | translate: { count: 7 } }}`.
 *
 * Impure on purpose: a pure pipe is only re-run when its arguments change, so after a language
 * switch it would keep returning the cached text. The lookup is a few property reads, and the
 * language signal it reads marks the view for refresh, so this stays cheap.
 */
@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(key: TranslationKey | (string & {}), params?: TranslationParams): string {
    return this.translationService.translate(key, params);
  }
}
