import { effect, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

/**
 * Keeps the page's `<title>` and meta description in the current language. Call it from a page
 * component's constructor; both callbacks may read signals (e.g. `TranslationService.translate`).
 *
 * @param title Returns the document title.
 * @param description Returns the meta description; omit to leave the tag untouched.
 */
export function syncPageMeta(title: () => string, description?: () => string): void {
  const titleService = inject(Title);
  const meta = inject(Meta);
  effect(() => {
    titleService.setTitle(title());
    if (description) meta.updateTag({ name: 'description', content: description() });
  });
}
