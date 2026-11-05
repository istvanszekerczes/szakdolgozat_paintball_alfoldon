import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit {
  private title = inject(Title);
  private meta = inject(Meta);

  ngOnInit(): void {
    this.title.setTitle('Rólunk – Az Underground Paintball története | Paintball Alföldön');
    this.meta.updateTag({
      name: 'description',
      content:
        'Ismerd meg a Paintball Alföldön történetét: versenyszerű paintball múlttal rendelkező játékmesterek, hét pálya az Alföldön és küldetésünk az aktív kikapcsolódásért.',
    });
  }
}
