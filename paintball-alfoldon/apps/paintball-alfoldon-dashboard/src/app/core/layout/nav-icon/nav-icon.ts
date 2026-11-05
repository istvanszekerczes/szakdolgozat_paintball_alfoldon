import { Component, input } from '@angular/core';

/** Stroke icons of the side menu (Angular strips SVG from [innerHTML], so they are written out here). */
@Component({
  selector: 'app-nav-icon',
  templateUrl: './nav-icon.html',
  host: { style: 'display: inline-flex' },
})
export class NavIcon {
  readonly name = input.required<string>();
}
