import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-contact',
  standalone: true,
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  ngOnInit(): void {
    this.title.setTitle('Kapcsolat és ajánlatkérés | Paintball Alföldön');
    this.meta.updateTag({
      name: 'description',
      content:
        'Lépj kapcsolatba velünk: telefonszám, e-mail és elérhetőségi idő. Hívj minket 06:00 és 22:00 között, vagy írj e-mailt, és 24 órán belül válaszolunk.',
    });
  }
}
