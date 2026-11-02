import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="page-header page-header--center">
      <div class="container">
        <span class="eyebrow">404</span>
        <h1 class="page-header__title">Ez az oldal nem található</h1>
        <p class="page-header__lead lead">
          Lehet, hogy elírtad a címet, vagy az oldal már nem létezik. Innen továbbmehetsz:
        </p>
        <div class="actions">
          <a routerLink="/" class="btn btn--primary btn--lg">Vissza a főoldalra</a>
          <a routerLink="/foglalas" class="btn btn--secondary btn--lg">Időpont foglalása</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
      margin-top: 2rem;
    }
  `,
})
export class NotFoundComponent implements OnInit, OnDestroy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  ngOnInit(): void {
    this.title.setTitle('Az oldal nem található | Paintball Alföldön');
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }

  ngOnDestroy(): void {
    this.meta.removeTag('name="robots"');
  }
}
