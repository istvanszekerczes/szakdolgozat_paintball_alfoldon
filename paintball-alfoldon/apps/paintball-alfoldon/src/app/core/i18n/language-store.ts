import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

/** Languages the site is translated to. Hungarian is the default. */
export type Language = 'hu' | 'en';

export const LANGUAGES: readonly Language[] = ['hu', 'en'];
export const DEFAULT_LANGUAGE: Language = 'hu';

type LanguageState = {
  language: Language;
};

const initialState: LanguageState = {
  language: DEFAULT_LANGUAGE,
};

/** The language the site is shown in. Components use `TranslationService`, never this store. */
export const LanguageStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withDevtools('language'),
  withMethods((store) => ({
    setLanguage(language: Language) {
      patchState(store, { language });
    },
  })),
);
