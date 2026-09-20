import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-header">
      <div class="container">
        <span class="eyebrow">Rólunk</span>
        <h1 class="page-header__title">Az Undergroundtól az Alföldig</h1>
        <p class="page-header__lead lead">
          Több mint két évtized a paintballban: versenyzőkből lett szervezők, hét pálya, több százezer játékos.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container about">
        <div class="prose about__story">
          <h2>Történetünk</h2>
          <p>
            Történetünk több mint két évtizeddel ezelőtt kezdődött. Alapítóink a versenyszerű paintball világából
            érkeztek, ahol a taktika, a csapatmunka és a tiszta adrenalin határozta meg a mindennapokat. Ezt a
            szenvedélyt szerettük volna átadni a nagyközönségnek is, ezért hoztuk létre az
            <strong>Underground Paintballt</strong>.
          </p>
          <p>
            Ahogy az évek során folyamatosan fejlődtünk, újabb és újabb pályákat nyitottunk a régió különböző
            pontjain. Hogy lefedettségünket és elhivatottságunkat jobban kifejezzük, nevünket
            <strong>Paintball Alföldönre</strong> változtattuk. Ma már hét pályán, hat városban várunk titeket,
            és büszkék vagyunk rá, hogy több százezer játékosnak nyújthattunk felejthetetlen pillanatokat.
          </p>
          <p class="about__timeline mono">Alapítva 2005 · Új név 2018</p>
        </div>

        <aside class="card about__mission">
          <span class="eyebrow">Küldetésünk</span>
          <h2 class="about__mission-title">Ki a szabadba, el a képernyők elől</h2>
          <div class="prose">
            <p>
              Legfőbb célunk egyszerű: <strong>kimozdítani az embereket – különösen a fiatalokat – a képernyők
              elől</strong>, és aktív, fizikai kihívásokkal teli szabadtéri tevékenységet biztosítani számukra.
            </p>
            <p>
              Úgy gondoljuk, hogy a paintball, a lézertag és az íjászat nem csupán játékok, hanem a kommunikáció, a
              csapatszellem és az önbizalom fejlesztésének kiváló eszközei.
            </p>
            <p>
              Szolgáltatásainkkal minden réteget kiszolgálunk: a legkisebb baráti társaságok szülinapi bulijától a
              multinacionális vállalatok több száz fős csapatépítő tréningjeiig biztosítunk professzionális
              lebonyolítást és maximális biztonságot.
            </p>
          </div>
        </aside>
      </div>
    </section>

    <section class="section section--alt section--line" aria-label="Számokban">
      <div class="container stats">
        <div class="stat"><span class="stat__num">20<em>+</em></span><span class="stat__label">év a sportban</span></div>
        <div class="stat"><span class="stat__num">7</span><span class="stat__label">pálya, 6 város</span></div>
        <div class="stat"><span class="stat__num">100k<em>+</em></span><span class="stat__label">játékos</span></div>
        <div class="stat"><span class="stat__num">100<em>%</em></span><span class="stat__label">adrenalin</span></div>
      </div>
    </section>

    <section class="section section--line cta">
      <div class="container cta__inner">
        <h2>Csatlakozz a következő bevetéshez</h2>
        <p class="lead">Tapasztald meg a Paintball Alföldön élményt a barátaiddal vagy a kollégáiddal.</p>
        <a routerLink="/foglalas" class="btn btn--primary btn--lg">Időpontot foglalok</a>
      </div>
    </section>
  `,
  styles: [
    `
      .about {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: clamp(2rem, 6vw, 5rem);
        align-items: start;
      }

      @media (max-width: 900px) {
        .about {
          grid-template-columns: 1fr;
        }
      }

      .about__story h2 {
        margin-bottom: 0.5rem;
      }

      .about__timeline {
        font-size: 0.8125rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--fg-3);
      }

      .about__mission {
        display: grid;
        gap: 1rem;
      }

      .about__mission-title {
        font-size: clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem);
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;
      }

      @media (max-width: 700px) {
        .stats {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .cta__inner {
        display: grid;
        justify-items: center;
        gap: 1.25rem;
        max-width: 640px;
        text-align: center;
      }
    `,
  ],
})
export class AboutComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  ngOnInit(): void {
    this.title.setTitle('Rólunk – Az Underground Paintball története | Paintball Alföldön');
    this.meta.updateTag({
      name: 'description',
      content:
        'Ismerd meg a Paintball Alföldön történetét: versenyszerű paintball múlttal rendelkező játékmesterek, hét pálya az Alföldön és küldetésünk az aktív kikapcsolódásért.',
    });
  }
}
