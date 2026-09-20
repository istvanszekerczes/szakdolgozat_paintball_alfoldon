import { Injectable } from '@angular/core';

export interface PaintballLocation {
  /** Route slug, e.g. `szeged-csarnok`. */
  id: string;
  /** City the venue belongs to — used as the primary label everywhere. */
  city: string;
  /** Short venue name that disambiguates cities with several fields. */
  venue: string;
  /** Covered (indoor) field vs. open-air field. */
  indoor: boolean;
  title: string;
  metaDesc: string;
  address: string;
  terrainType: string;
  detailedDescription: string;
  minHeadcount: number;
  optHeadcount: string;
  maxHeadcount: number;
  extraActivities: string[];
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly locations: PaintballLocation[] = [
    {
      id: 'szeged',
      city: 'Szeged',
      venue: 'Boszorkánysziget',
      indoor: false,
      title: 'Szeged Paintball Pálya - Boszorkánysziget | Paintball Alföldön',
      metaDesc: 'Paintball Szegeden a Tisza-parti Boszorkánysziget ősfás, vadregényes erdejében. Könnyen megközelíthető, taktikai pálya 24-150 főre.',
      address: 'Szeged, Boszorkánysziget (a vasútállomástól ~1 km-re)',
      terrainType: 'Természetes erdős terep ősfákkal',
      detailedDescription: 'A szegedi Boszorkánysziget ideális helyszín a paintball kedvelőinek. A Tisza-parti ligetes erdő természetes fedezékeivel, ősfáival és a kiépített taktikai akadályokkal igazi katonai küldetés hangulatát idézi. Mindössze 1 km-re található a vasútállomástól, így városon belülről is gyorsan és könnyen elérhető akár gyalogosan vagy kerékpárral is.',
      minHeadcount: 10,
      optHeadcount: '24–100',
      maxHeadcount: 150,
      extraActivities: ['Airsoft', 'Lézer tag', 'Archery tag'],
      lat: 46.232385,
      lng: 20.143227
    },
    {
      id: 'szeged-csarnok',
      city: 'Szeged',
      venue: 'Katonai csarnok',
      indoor: true,
      title: 'Szeged Indoor Paintball - Katonai Csarnok | Paintball Alföldön',
      metaDesc: 'Indoor paintball és lézertag Szegeden. 2000 m²-es egykori katonai csarnok épület akadályokkal, CQB harctérrel.',
      address: 'Szeged, Külterületi ipari zóna (egykori laktanya épület)',
      terrainType: '2000 m²-es fedett katonai csarnok épület',
      detailedDescription: 'Szegedi második helyszínünk egy hatalmas, 2000 négyzetméteres egykori katonai csarnok és raktárépület. A teljesen zárt, időjárásálló beltéri harctéren falak, helyiségek, katonai járműroncsok és mesterséges fedezékek biztosítják a CQB (közeli harc) élményét. Kitűnő választás esős időben, téli időszakban, illetve izgalmas paintball, intenzív airsoft és lézertag összecsapásokhoz.',
      minHeadcount: 8,
      optHeadcount: '12–80',
      maxHeadcount: 100,
      extraActivities: ['Airsoft', 'Lézer tag'],
      lat: 46.234412,
      lng: 20.138107
    },
    {
      id: 'szentes',
      city: 'Szentes',
      venue: 'Rekreációs zóna',
      indoor: false,
      title: 'Szentes Paintball és Szabadidő Pálya | Paintball Alföldön',
      metaDesc: 'Paintball Szentes területén. Taktikai akadályok, dús növényzet és kiváló hangulat baráti társaságoknak és csapatépítőknek.',
      address: 'Szentes, Külterületi rekreációs zóna (részletek egyeztetés szerint)',
      terrainType: 'Füves-fás vegyes terep mesterséges fedezékekkel',
      detailedDescription: '[TODO: Szentesi részletes pálya adatok feltöltése.] Szentesi szabadtéri pályánk ideális helyszín kisebb és közepes méretű csapatok számára. A vegyes növényzet és a gondosan elhelyezett mesterséges fedezékek kiváló lehetőséget biztosítanak a taktikai játékokhoz, rekreációs programokhoz. Baráti társaságok és kisebb cégek számára egyaránt kitűnő választás.',
      minHeadcount: 10,
      optHeadcount: '10–50',
      maxHeadcount: 100,
      extraActivities: ['Lézer tag', 'Buborék foci'],
      lat: 46.662945,
      lng: 20.280217
    },
    {
      id: 'szolnok',
      city: 'Szolnok',
      venue: 'Tiszaliget',
      indoor: true,
      title: 'Szolnok Paintball Pálya - Tiszaliget (Indoor) | Paintball Alföldön',
      metaDesc: 'Szolnoki indoor paintball a Tiszaligeti Ifjúsági Tábor fedett épületeiben. Kiválóan alkalmas csapatépítőkre és diákcsoportoknak.',
      address: 'Szolnok, Tiszaliget sétány (az Ifjúsági Tábor fedett épületeiben)',
      terrainType: 'Fedett csarnok és épületek',
      detailedDescription: 'A szolnoki Tiszaliget az Ifjúsági Tábor területén fekszik, és kiválóan alkalmas beltéri paintball csaták lebonyolítására. A kiépített fedett csarnokok, szobák és folyosók időjárástól független, pörgős CQB (közeli harc) stílusú küldetéseket tesznek lehetővé. Diákcsoportok és céges csapatépítők számára is első osztályú választás.',
      minHeadcount: 10,
      optHeadcount: '20–150',
      maxHeadcount: 300,
      extraActivities: ['Lézer tag', 'Archery tag', 'Vízifoci', 'Ugráló vár'],
      lat: 47.162229,
      lng: 20.186734
    },
    {
      id: 'kecskemet',
      city: 'Kecskemét',
      venue: 'Homokbánya',
      indoor: true,
      title: 'Kecskemét Indoor Paintball - Homokbánya | Paintball Alföldön',
      metaDesc: 'Kecskeméti indoor paintball a Homokbányánál, a Decathlon mellett. 5000 m²-es, többszintes fedett pálya az M5-östől 3 percre.',
      address: 'Kecskemét, Téglás utca 8. (a Decathlon mellett)',
      terrainType: '5000 m²-es fedett, többszintes épület',
      detailedDescription: 'Kecskeméti helyszínünk a régió egyik legnagyobb fedett (indoor) paintball komplexuma. Az 5000 négyzetméteres, többszintes épület az M5-ös autópálya lehajtójától mindössze 3 percre található. Az időjárástól független, izgalmas szobák, folyosók és lépcsőházak tökéletes terepet biztosítanak a CQB (közeli harc) stílusú összecsapásokhoz.',
      minHeadcount: 10,
      optHeadcount: '20–100',
      maxHeadcount: 150,
      extraActivities: ['Airsoft', 'Lézer tag', 'Archery tag'],
      lat: 46.887551,
      lng: 19.646280
    },
    {
      id: 'bekescsaba',
      city: 'Békéscsaba',
      venue: 'Póstelek',
      indoor: false,
      title: 'Békéscsaba Paintball Pálya - Póstelek | Paintball Alföldön',
      metaDesc: 'Békéscsabai paintball Pósteleken. Több hektáros erdős pálya, izgalmas szintkülönbségek, dombok és gödrök a természet lágyán.',
      address: 'Békéscsaba, Pósteleki erdő',
      terrainType: 'Több hektáros erdős pálya dombokkal és gödrökkel',
      detailedDescription: 'A békéscsabai pálya a pósteleki erdőben található, kiterjedt erdei környezetben. A terep különlegességét a természetes és mesterséges szintkülönbségek adják: dombok, lövészárkok és mélyedések szabdalják a pályát, ami különleges taktikai mélységet ad a játéknak. Ideális választás azoknak, akik szeretik a természet közelségét és a terepviszonyok adta kihívásokat.',
      minHeadcount: 10,
      optHeadcount: '12–80',
      maxHeadcount: 120,
      extraActivities: ['Lézer tag', 'Buborék foci', 'Archery tag'],
      lat: 46.684613,
      lng: 21.194293
    },
    {
      id: 'oroshaza',
      city: 'Orosháza',
      venue: 'Volt katonai gyakorlótér',
      indoor: false,
      title: 'Orosháza Paintball Pálya - Volt Katonai Gyakorlótér | Paintball Alföldön',
      metaDesc: 'Paintball Orosházán a volt katonai gyakorlópályán. Lőárkok, dombok és elszigetelt katonai terület, akár 1000+ fős óriásrendezvényekre.',
      address: 'Orosháza, Volt katonai gyakorlópálya',
      terrainType: 'Volt katonai gyakorlótér lőárkokkal és bunkerekkel',
      detailedDescription: 'Az orosházi pálya egy valódi volt katonai gyakorlópályán kapott helyet. A hatalmas, elszigetelt területen lőárkok, fedezékek és dombok találhatók. Eredeti katonai jellegéből adódóan rendkívül hangulatos és alkalmas akár 1000 főt meghaladó óriásrendezvények, nagy létszámú céges fesztiválok vagy paintball találkozók lebonyolítására is.',
      minHeadcount: 10,
      optHeadcount: '12–120',
      maxHeadcount: 150, // Technical max in a typical game group; event capacity is 1000+
      extraActivities: ['Lézer tag', 'Archery tag', 'Buborék foci'],
      lat: 46.564047,
      lng: 20.643860
    }
  ];

  getLocations(): PaintballLocation[] {
    return this.locations;
  }

  getLocationById(id: string): PaintballLocation | undefined {
    return this.locations.find(loc => loc.id === id);
  }

  /** Human label for the field type, used in pills and meta lines. */
  static fieldType(loc: PaintballLocation): string {
    return loc.indoor ? 'Fedett' : 'Szabadtéri';
  }
}
