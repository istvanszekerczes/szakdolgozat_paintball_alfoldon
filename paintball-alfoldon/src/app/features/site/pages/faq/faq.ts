import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Accordion } from '../../../../shared/components/accordion/accordion';

interface FaqItem {
  q: string;
  a: string;
}

@Component({
  selector: 'app-faq-page',
  imports: [Accordion, RouterLink],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
})
export class Faq implements OnInit {
  private title = inject(Title);
  private meta = inject(Meta);

  readonly faqs: FaqItem[] = [
    {
      q: 'Hány játékos játszhat egyszerre?',
      a: 'A minimális ajánlott létszám ~10 fő, de ennél kisebb csoportok is jöhetnek játszani. Technikai felső határ nincs, ugyanakkor 80 fő feletti egyidejű játék esetén kérjük az előzetes egyeztetést, hogy a pályabeosztást és a játékmesterek számát megfelelően igazíthassuk.',
    },
    {
      q: 'Mi tartozik a paintball alapfelszereléshez?',
      a: 'Az alapcsomag tartalmazza a paintball fegyvert (markert) és annak minden szükséges tartozékát, a korlátlan sűrített hajtógáztöltést a játék során, valamint egy páramentesítő lencsével felszerelt professzionális védőmaszkot.',
    },
    {
      q: 'Kijön-e a festék a ruhából?',
      a: 'Igen! A golyókban lévő festék természetes ételszínezék alapú, biológiailag lebomló és vízben kiválóan oldódik, így egy egyszerű otthoni mosással teljesen eltávolítható a ruházatból. Igény esetén terepszínű védőoverált is biztosítunk a helyszínen.',
    },
    {
      q: 'Káros-e a paintball golyó a környezetre?',
      a: 'Egyáltalán nem. A lövedékek 100%-ban biológiailag lebomló anyagokból állnak. A külső héj zselatinburok, a benne lévő színezék pedig nem mérgező, ételfestéket tartalmazó anyag, ami a természetben az eső és a napsütés hatására rövid idő alatt nyomtalanul feloldódik.',
    },
    {
      q: 'Lehet-e fényképezni a játék közben?',
      a: 'Igen, de biztonsági okokból kizárólag megfelelő védőfelszereléssel (maszkban) rendelkező fotós tartózkodhat a pálya területén a játék alatt. Jó hír, hogy játékmestereink is rendszeresen készítenek minőségi akciófotókat a csatákról, amelyeket utólag ingyenesen feltöltünk a Facebook galériánkba.',
    },
  ];

  ngOnInit(): void {
    this.title.setTitle('Gyakori kérdések a játékról | Paintball Alföldön');
    this.meta.updateTag({
      name: 'description',
      content:
        'Mindent a paintballról: csoportméretek, alapfelszerelés, környezetvédelmi szempontok, ruházat tisztítása és fotózási szabályok pályáinkon.',
    });
  }
}
