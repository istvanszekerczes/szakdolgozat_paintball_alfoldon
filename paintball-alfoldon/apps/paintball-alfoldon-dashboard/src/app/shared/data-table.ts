import { Component, input } from '@angular/core';

export interface Column {
  label: string;
  /** Right-aligned numeric column. */
  num?: boolean;
}

/**
 * Card with a table: the header comes from {@code columns}, the rows (`<tr>`) are projected by the page.
 * Shows the loading / empty text itself when {@code rows} is 0.
 */
@Component({
  selector: 'app-data-table',
  template: `
    <section class="card dt-card" [attr.aria-label]="label()">
      <div class="dt-scroll">
        <table class="dt" [style.min-width.px]="minWidth()">
          <thead>
            <tr>
              @for (c of columns(); track c.label) {
                <th scope="col" [class.num]="c.num">{{ c.label }}</th>
              }
            </tr>
          </thead>
          <tbody>
            <ng-content />
            @if (!rows()) {
              <tr>
                <td class="muted" [attr.colspan]="columns().length">{{ loading() ? 'Betöltés…' : emptyText() }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class DataTable {
  readonly label = input.required<string>();
  readonly columns = input.required<Column[]>();
  readonly rows = input.required<number>();
  readonly loading = input(false);
  readonly emptyText = input('Nincs megjeleníthető adat.');
  readonly minWidth = input(560);
}
