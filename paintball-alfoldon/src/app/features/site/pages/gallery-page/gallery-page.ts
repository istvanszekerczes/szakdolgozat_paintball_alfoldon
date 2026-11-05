import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Gallery } from '../../../../shared/components/gallery/gallery';

@Component({
  selector: 'app-gallery-page',
  standalone: true,
  imports: [Gallery],
  templateUrl: './gallery-page.html',
  styleUrl: './gallery-page.scss',
})
export class GalleryPage implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  ngOnInit(): void {
    this.title.setTitle('Galéria – Képek a pályákról | Paintball Alföldön');
    this.meta.updateTag({
      name: 'description',
      content:
        'Nézd meg a paintball, lézertag és szabadtéri programjainkon készült képeket. Kedvcsináló és galéria a pályákról.',
    });
  }
}
