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
  templateUrl: './data-table.html',
})
export class DataTable {
  readonly label = input.required<string>();
  readonly columns = input.required<Column[]>();
  readonly rows = input.required<number>();
  readonly loading = input(false);
  readonly emptyText = input('Nincs megjeleníthető adat.');
  readonly minWidth = input(560);
}
