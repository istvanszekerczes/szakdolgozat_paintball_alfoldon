import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { HungaryMap } from '../../../venues/components/hungary-map/hungary-map';
import { LocationService } from '../../../venues/services/location-service';

interface Activity {
  title: string;
  text: string;
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, HungaryMap],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  private readonly locationService = inject(LocationService);
  readonly locations = this.locationService.getLocations();
  readonly groups = this.locationService.getGroupRange();
  readonly fieldType = LocationService.fieldType;

  readonly activities: Activity[] = [
    {
      title: 'Airsoft',
      text: 'Még valósághűbb katonai szimulációs játék finomabb lövedékekkel és komolyabb harci taktikával.',
    },
    {
      title: 'Lézertag',
      text: 'Fájdalommentes harci játék infravörös fegyverekkel. Ideális családoknak, gyerekzsúrokra és vegyes csapatoknak.',
    },
    {
      title: 'Íjász harc (archery tag)',
      text: 'Biztonságos íjászat szivacsos végű nyilakkal. A dodgeball és az íjászat tökéletes kombinációja.',
    },
    {
      title: 'Buborék foci',
      text: 'Légbuborékba burkolózva focizni – hatalmas ütközések, folyamatos nevetés és garantált jókedv.',
    },
    {
      title: 'Vízifoci',
      text: 'Nyári szezonális kedvenc: felfújható vizes pályán való csúszkálós labdarúgás.',
    },
    {
      title: 'Ugráló vár',
      text: 'A legkisebbeknek fenntartott biztonságos játékterület a családi eseményeken.',
    },
  ];

  readonly testimonials: Testimonial[] = [
    {
      quote:
        'A szegedi Boszorkányszigeten tartottuk a cégünk éves csapatépítőjét. Az erdei terep hangulata fantasztikus volt, a játékvezetők pedig végtelenül profik és rugalmasak. Mindenki imádta!',
      name: 'Kovács Balázs',
      role: 'HR igazgató, Szeged',
    },
    {
      quote:
        'A fiam szülinapi buliját szerveztük ide, lézertagot játszottak a srácok. Szuper volt látni, hogy a gyerekek órákon át rohantak a szabadban ahelyett, hogy a képernyőt nézték volna. Köszönjük!',
      name: 'Nagy Eszter',
      role: 'Szülő, Kecskemét',
    },
  ];

  ngOnInit(): void {
    this.title.setTitle('Paintball Alföldön – Paintball, lézertag és csapatjátékok hét pályán');
    this.meta.updateTag({
      name: 'description',
      content:
        'Paintball, lézertag, airsoft és íjászat hét pályán az Alföldön: Szeged, Szentes, Szolnok, Kecskemét, Békéscsaba és Orosháza. Erdei terepek és fedett csarnokok.',
    });
  }
}
