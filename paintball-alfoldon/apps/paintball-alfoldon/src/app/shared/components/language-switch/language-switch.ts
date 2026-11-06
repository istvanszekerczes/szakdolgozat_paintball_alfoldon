import { Component, inject } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate-pipe';
import { TranslationService } from '../../../core/i18n/translation-service';

/** HU / EN toggle in the site header; switches every text at once, without a reload. */
@Component({
  selector: 'app-language-switch',
  imports: [TranslatePipe],
  templateUrl: './language-switch.html',
  styleUrl: './language-switch.scss',
})
export class LanguageSwitch {
  protected readonly translationService = inject(TranslationService);
}
