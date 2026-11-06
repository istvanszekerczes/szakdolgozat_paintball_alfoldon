import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, PLATFORM_ID, Service, computed, effect, inject } from '@angular/core';
import { DEFAULT_LANGUAGE, LANGUAGES, Language, LanguageStore } from './language-store';
import { en } from './translations/en';
import { Translations, hu } from './translations/hu';

/** Dotted path of every text in the language files, e.g. `header.home`. */
type PathsOf<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${PathsOf<T[K]>}`;
}[keyof T & string];

export type TranslationKey = PathsOf<Translations>;

/** Values for the `{name}` placeholders of a text. */
export type TranslationParams = Record<string, string | number | null | undefined>;

const DICTIONARIES: Record<Language, Translations> = { hu, en };

/** BCP 47 locale of each language, for `Intl` date and number formatting. */
const LOCALES: Record<Language, string> = { hu: 'hu-HU', en: 'en-GB' };

const STORAGE_KEY = 'pb-language';

/**
 * Runtime translation of the site. The language can be switched at any time without reloading:
 * every text read through `translate` (or the `translate` pipe) follows the `language` signal.
 */
@Service()
export class TranslationService {
  private store = inject(LanguageStore);
  private document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly languages = LANGUAGES;
  readonly language = computed(() => this.store.language());
  readonly locale = computed(() => LOCALES[this.language()]);
  private readonly dictionary = computed(() => DICTIONARIES[this.language()]);

  constructor() {
    // Keep <html lang> right for screen readers and search engines.
    effect(() => {
      this.document.documentElement.lang = this.language();
    });
  }

  /**
   * Switches the site to another language.
   *
   * @param language The new language.
   */
  setLanguage(language: Language): void {
    this.store.setLanguage(language);
    // Remember the visitor's choice for the next visit.
    if (this.isBrowser) {
      try {
        localStorage.setItem(STORAGE_KEY, language);
      } catch {
        // Storage can be unavailable (private mode); the switch still works for this visit.
      }
    }
  }

  /**
   * Applies the language saved on an earlier visit. Called once the page has hydrated, so the
   * prerendered (Hungarian) markup is taken over before any text changes.
   */
  restoreSavedLanguage(): void {
    if (!this.isBrowser) return;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      return;
    }
    if (saved && (LANGUAGES as readonly string[]).includes(saved)) {
      this.setLanguage(saved as Language);
    }
  }

  /**
   * Looks up a text in the current language. Reading it inside a template, `computed` or `effect`
   * makes that code follow language switches.
   *
   * @param key Dotted path of the text, e.g. `header.home`.
   * @param params Values for the `{name}` placeholders.
   * @returns The text; the Hungarian one if the current language lacks it, the key itself if
   *   neither has it (so a message coming from the server passes through unchanged).
   */
  translate(key: TranslationKey | (string & {}), params?: TranslationParams): string {
    const text = lookup(this.dictionary(), key) ?? lookup(DICTIONARIES[DEFAULT_LANGUAGE], key);
    return text === undefined ? key : interpolate(text, params);
  }

  /**
   * Like `translate`, but falls back to the given text when the key is unknown — for names that
   * the backend sends and only some of which have a translation.
   */
  translateOr(key: string, fallback: string, params?: TranslationParams): string {
    const text = lookup(this.dictionary(), key);
    return text === undefined ? fallback : interpolate(text, params);
  }
}

function lookup(dictionary: Translations, key: string): string | undefined {
  let node: unknown = dictionary;
  for (const part of key.split('.')) {
    if (node === null || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(text: string, params?: TranslationParams): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined || value === null ? match : String(value);
  });
}
