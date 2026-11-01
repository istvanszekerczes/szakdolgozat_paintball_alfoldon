import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** Menu items whose backend part is not built yet. */
@Component({
  selector: 'app-coming-soon',
  template: `
    <h1>{{ name }}</h1>
    <section class="card box">
      <h2>Hamarosan</h2>
      <p class="muted">Ez a nézet a következő fejlesztési szakaszban készül el, amikor a backend is megkapja a hozzá tartozó végpontokat.</p>
    </section>
  `,
  styles: `
    .box { margin-top: 20px; max-width: 560px; }
    p { margin: 8px 0 0; line-height: 1.5; }
  `,
})
export class ComingSoonPage {
  protected readonly name = inject(ActivatedRoute).snapshot.data['name'] as string;
}
