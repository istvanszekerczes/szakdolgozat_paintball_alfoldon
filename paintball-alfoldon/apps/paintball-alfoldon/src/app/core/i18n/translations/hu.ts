/**
 * Hungarian texts of the site — the default language and the source of the translation keys.
 * Every other language must have exactly the same shape (see `Translations`).
 *
 * Placeholders are written as `{name}` and filled in by `TranslationService.translate`.
 */
export const hu = {
  common: {
    indoor: 'Fedett',
    outdoor: 'Szabadtéri',
    people: '{count} fő',
    book: 'Foglalás',
    bookSlot: 'Időpont foglalása',
    bookThisVenue: 'Foglalás erre a pályára',
    requestQuote: 'Árajánlatot kérek',
    contactUs: 'Kapcsolatfelvétel',
    retry: 'Újra',
    edit: 'Módosítás',
    close: 'Bezárás',
    details: 'Részletek',
    titleSuffix: '{title} | Paintball Alföldön',
  },

  language: {
    label: 'Nyelv',
    hu: 'Magyar',
    en: 'English',
  },

  header: {
    skipLink: 'Ugrás a tartalomra',
    homeAria: 'Paintball Alföldön – főoldal',
    mainNav: 'Fő navigáció',
    mobileNav: 'Mobil navigáció',
    home: 'Főoldal',
    venues: 'Pályák',
    ourVenues: 'Pályáink',
    about: 'Rólunk',
    faq: 'GYIK',
    gallery: 'Galéria',
    contact: 'Kapcsolat',
    menuOpen: 'Menü megnyitása',
    menuClose: 'Menü bezárása',
  },

  footer: {
    blurb:
      'Több mint 20 év tapasztalat paintball, lézertag és csapatjátékok szervezésében, hét pályán az Alföldön.',
    navigation: 'Navigáció',
    faqLong: 'Gyakori kérdések',
    reach: 'Elérhetőség',
    hours: 'Hétfő–vasárnap, 06:00–22:00',
    rights: '© 2026 Paintball Alföldön. Minden jog fenntartva.',
  },

  actionBar: {
    call: 'Hívás',
    callAria: 'Hívás: {phone}',
  },

  phoneChannel: {
    eyebrow: 'Telefon',
    hours: 'Hétfőtől vasárnapig 06:00–22:00, ünnepnapokon is.',
    action: 'Hívás most',
  },

  emailChannel: {
    eyebrow: 'E-mail',
    text: 'Ajánlatkérésre és levelekre 24 órán belül válaszolunk.',
    action: 'E-mail küldése',
  },

  home: {
    metaTitle: 'Paintball Alföldön – Paintball, lézertag és csapatjátékok hét pályán',
    metaDescription:
      'Paintball, lézertag, airsoft és íjászat hét pályán az Alföldön: Szeged, Szentes, Szolnok, Kecskemét, Békéscsaba és Orosháza. Erdei terepek és fedett csarnokok.',
    heroEyebrow: 'Paintball · lézertag · íjászat · csapatjátékok',
    heroTitleLine1: 'Paintball az Alföldön,',
    heroTitleLine2: 'hét pályán.',
    heroLead:
      'Szabadtéri erdei terepek és fedett csarnokok Szegedtől Szolnokig. Baráti társaságoknak, gyerekzsúrokra és több száz fős céges rendezvényekre.',
    factsAria: 'Röviden',
    factVenues: 'pálya, 6 város',
    factYears: 'év tapasztalat',
    factGroups: 'fős csoportok',
    factIndoor: 'fedett, télen is játszható',
    mapEyebrow: 'Helyszíneink',
    mapTitle: 'Válassz pályát a térképen',
    mapText:
      'Válassz a listából, hogy a térkép ráközelítsen, majd kattints a jelölőre a részletekért. A fedett pályák télen és rossz időben is játszhatók.',
    venuesEyebrow: 'Pályáink',
    venuesTitle: 'Erdei terepek és fedett csarnokok',
    whyEyebrow: 'Miért mi?',
    whyTitle: 'Két évtized tapasztalat, gördülékeny szervezés',
    whyLead:
      'Tudjuk, hogyan kell megszervezni a tökéletes paintball összecsapást. Akár baráti játékról, akár több száz fős céges rendezvényről van szó, ránk számíthatsz.',
    whyGearTitle: 'Teljes felszerelés',
    whyGearText: 'marker, páramentes maszk, korlátlan hajtógáz, igény szerint overál.',
    whyStaffTitle: 'Képzett játékvezetők',
    whyStaffText: 'biztonságos, jól vezetett játékmenet minden korosztálynak.',
    whyGroupsTitle: 'Rugalmas létszám',
    whyGroupsText: 'kis baráti köröktől óriásrendezvényekig.',
    statPlayers: 'elégedett játékos',
    activitiesEyebrow: 'Szolgáltatások',
    activitiesTitle: 'Kiegészítő tevékenységek',
    activitiesText:
      'A klasszikus paintball mellett az alábbi csapatjátékokat kínáljuk a különböző pályáinkon.',
    quotesEyebrow: 'Visszajelzések',
    quotesTitle: 'Vélemények rólunk',
    ctaTitle: 'Készen állsz a bevetésre?',
    ctaLead: 'Foglald le az időpontodat még ma, vagy kérj egyedi árajánlatot a rendezvényedre.',
  },

  activities: {
    airsoft: {
      tag: 'Airsoft',
      title: 'Airsoft',
      text: 'Még valósághűbb katonai szimulációs játék finomabb lövedékekkel és komolyabb harci taktikával.',
    },
    laserTag: {
      tag: 'Lézer tag',
      title: 'Lézertag',
      text: 'Fájdalommentes harci játék infravörös fegyverekkel. Ideális családoknak, gyerekzsúrokra és vegyes csapatoknak.',
    },
    archeryTag: {
      tag: 'Archery tag',
      title: 'Íjász harc (archery tag)',
      text: 'Biztonságos íjászat szivacsos végű nyilakkal. A dodgeball és az íjászat tökéletes kombinációja.',
    },
    bubbleFootball: {
      tag: 'Buborék foci',
      title: 'Buborék foci',
      text: 'Légbuborékba burkolózva focizni – hatalmas ütközések, folyamatos nevetés és garantált jókedv.',
    },
    waterFootball: {
      tag: 'Vízifoci',
      title: 'Vízifoci',
      text: 'Nyári szezonális kedvenc: felfújható vizes pályán való csúszkálós labdarúgás.',
    },
    bouncyCastle: {
      tag: 'Ugráló vár',
      title: 'Ugráló vár',
      text: 'A legkisebbeknek fenntartott biztonságos játékterület a családi eseményeken.',
    },
  },

  testimonials: {
    teamBuilding: {
      quote:
        'A szegedi Boszorkányszigeten tartottuk a cégünk éves csapatépítőjét. Az erdei terep hangulata fantasztikus volt, a játékvezetők pedig végtelenül profik és rugalmasak. Mindenki imádta!',
      name: 'Kovács Balázs',
      role: 'HR igazgató, Szeged',
    },
    birthday: {
      quote:
        'A fiam szülinapi buliját szerveztük ide, lézertagot játszottak a srácok. Szuper volt látni, hogy a gyerekek órákon át rohantak a szabadban ahelyett, hogy a képernyőt nézték volna. Köszönjük!',
      name: 'Nagy Eszter',
      role: 'Szülő, Kecskemét',
    },
  },

  about: {
    metaTitle: 'Rólunk – Az Underground Paintball története',
    metaDescription:
      'Ismerd meg a Paintball Alföldön történetét: versenyszerű paintball múlttal rendelkező játékmesterek, hét pálya az Alföldön és küldetésünk az aktív kikapcsolódásért.',
    eyebrow: 'Rólunk',
    title: 'Az Undergroundtól az Alföldig',
    lead: 'Több mint két évtized a paintballban: versenyzőkből lett szervezők, hét pálya, több százezer játékos.',
    storyTitle: 'Történetünk',
    story1:
      'Történetünk több mint két évtizeddel ezelőtt kezdődött. Alapítóink a versenyszerű paintball világából érkeztek, ahol a taktika, a csapatmunka és a tiszta adrenalin határozta meg a mindennapokat. Ezt a szenvedélyt szerettük volna átadni a nagyközönségnek is, ezért hoztuk létre az',
    story1Name: 'Underground Paintballt',
    story2Before:
      'Ahogy az évek során folyamatosan fejlődtünk, újabb és újabb pályákat nyitottunk a régió különböző pontjain. Hogy lefedettségünket és elhivatottságunkat jobban kifejezzük, nevünket',
    story2Name: 'Paintball Alföldönre',
    story2After:
      ' változtattuk. Ma már hét pályán, hat városban várunk titeket, és büszkék vagyunk rá, hogy több százezer játékosnak nyújthattunk felejthetetlen pillanatokat.',
    timeline: 'Alapítva 2005 · Új név 2018',
    missionEyebrow: 'Küldetésünk',
    missionTitle: 'Ki a szabadba, el a képernyők elől',
    mission1Before: 'Legfőbb célunk egyszerű:',
    mission1Strong: 'kimozdítani az embereket – különösen a fiatalokat – a képernyők elől',
    mission1After:
      ', és aktív, fizikai kihívásokkal teli szabadtéri tevékenységet biztosítani számukra.',
    mission2:
      'Úgy gondoljuk, hogy a paintball, a lézertag és az íjászat nem csupán játékok, hanem a kommunikáció, a csapatszellem és az önbizalom fejlesztésének kiváló eszközei.',
    mission3:
      'Szolgáltatásainkkal minden réteget kiszolgálunk: a legkisebb baráti társaságok szülinapi bulijától a multinacionális vállalatok több száz fős csapatépítő tréningjeiig biztosítunk professzionális lebonyolítást és maximális biztonságot.',
    statsAria: 'Számokban',
    statYears: 'év a sportban',
    statVenues: 'pálya, 6 város',
    statPlayers: 'játékos',
    statAdrenaline: 'adrenalin',
    ctaTitle: 'Csatlakozz a következő bevetéshez',
    ctaLead: 'Tapasztald meg a Paintball Alföldön élményt a barátaiddal vagy a kollégáiddal.',
    ctaButton: 'Időpontot foglalok',
  },

  faq: {
    metaTitle: 'Gyakori kérdések a játékról',
    metaDescription:
      'Mindent a paintballról: csoportméretek, alapfelszerelés, környezetvédelmi szempontok, ruházat tisztítása és fotózási szabályok pályáinkon.',
    eyebrow: 'GYIK',
    title: 'Gyakori kérdések',
    lead: 'Mindent összeszedtünk, amit a játék előtt tudnod kell. Ha további kérdésed van, keress minket bizalommal.',
    helpEyebrow: 'Segítség',
    helpTitle: 'További kérdésed van?',
    helpText:
      'Ha nem találtál választ a kérdésedre, vagy egyedi igényekkel érkeznél, szívesen segítünk telefonon vagy e-mailben is.',
    items: {
      players: {
        q: 'Hány játékos játszhat egyszerre?',
        a: 'A minimális ajánlott létszám ~10 fő, de ennél kisebb csoportok is jöhetnek játszani. Technikai felső határ nincs, ugyanakkor 80 fő feletti egyidejű játék esetén kérjük az előzetes egyeztetést, hogy a pályabeosztást és a játékmesterek számát megfelelően igazíthassuk.',
      },
      equipment: {
        q: 'Mi tartozik a paintball alapfelszereléshez?',
        a: 'Az alapcsomag tartalmazza a paintball fegyvert (markert) és annak minden szükséges tartozékát, a korlátlan sűrített hajtógáztöltést a játék során, valamint egy páramentesítő lencsével felszerelt professzionális védőmaszkot.',
      },
      paint: {
        q: 'Kijön-e a festék a ruhából?',
        a: 'Igen! A golyókban lévő festék természetes ételszínezék alapú, biológiailag lebomló és vízben kiválóan oldódik, így egy egyszerű otthoni mosással teljesen eltávolítható a ruházatból. Igény esetén terepszínű védőoverált is biztosítunk a helyszínen.',
      },
      environment: {
        q: 'Káros-e a paintball golyó a környezetre?',
        a: 'Egyáltalán nem. A lövedékek 100%-ban biológiailag lebomló anyagokból állnak. A külső héj zselatinburok, a benne lévő színezék pedig nem mérgező, ételfestéket tartalmazó anyag, ami a természetben az eső és a napsütés hatására rövid idő alatt nyomtalanul feloldódik.',
      },
      photos: {
        q: 'Lehet-e fényképezni a játék közben?',
        a: 'Igen, de biztonsági okokból kizárólag megfelelő védőfelszereléssel (maszkban) rendelkező fotós tartózkodhat a pálya területén a játék alatt. Jó hír, hogy játékmestereink is rendszeresen készítenek minőségi akciófotókat a csatákról, amelyeket utólag ingyenesen feltöltünk a Facebook galériánkba.',
      },
    },
  },

  gallery: {
    metaTitle: 'Galéria – Képek a pályákról',
    metaDescription:
      'Nézd meg a paintball, lézertag és szabadtéri programjainkon készült képeket. Kedvcsináló és galéria a pályákról.',
    eyebrow: 'Galéria',
    title: 'Képek a pályákról',
    lead: 'Ízelítő a hangulatból és a felszerelésekből. A teljes albumokat minden játék után a Facebook-oldalunkon tesszük közzé.',
    fbTitle: 'Friss képek minden játék után',
    fbBefore: 'A játékmesterek által készített teljes albumokat a hivatalos',
    fbLink: 'Facebook-oldalunkon',
    fbAfter: ' tesszük közzé. Keresd meg magad és a csapatodat az akcióképek között!',
    listAria: 'Galéria',
    open: 'Megnyitás: {caption}',
    previous: 'Előző kép',
    next: 'Következő kép',
    captions: {
      szeged: 'Szeged – Boszorkánysziget, erdei pálya',
      szegedHall: 'Szeged – Katonai csarnok, fedett CQB pálya',
      szentes: 'Szentes – rekreációs zóna, szabadtéri pálya',
      szolnok: 'Szolnok – Tiszaliget, fedett épületek',
      kecskemet: 'Kecskemét – Homokbánya, többszintes indoor pálya',
      bekescsaba: 'Békéscsaba – Póstelek, erdei terep lövészárkokkal',
      oroshaza: 'Orosháza – volt katonai gyakorlótér',
    },
  },

  contact: {
    metaTitle: 'Kapcsolat és ajánlatkérés',
    metaDescription:
      'Lépj kapcsolatba velünk: telefonszám, e-mail és elérhetőségi idő. Hívj minket 06:00 és 22:00 között, vagy írj e-mailt, és 24 órán belül válaszolunk.',
    eyebrow: 'Kapcsolat',
    title: 'Beszéljünk a játékról',
    lead: 'Céges csapatépítőt, születésnapot vagy legénybúcsút szervezel? Kérdésed van a felszerelésről? Hívj vagy írj nekünk – e-mailre 24 órán belül válaszolunk.',
  },

  notFound: {
    metaTitle: 'Az oldal nem található',
    title: 'Ez az oldal nem található',
    lead: 'Lehet, hogy elírtad a címet, vagy az oldal már nem létezik. Innen továbbmehetsz:',
    home: 'Vissza a főoldalra',
  },

  location: {
    keyFactsAria: 'Fő adatok',
    recommended: 'Ajánlott {count} fő',
    max: 'Max. {count} fő',
    aboutTitle: 'A pályáról',
    extrasTitle: 'Kiegészítő programok',
    extrasText:
      'A klasszikus paintball mellett ezen a pályán előzetes egyeztetés szerint elérhető:',
    mapTitle: 'Térkép',
    directions: 'Útvonalterv',
    specsTitle: 'Adatok',
    address: 'Cím',
    terrain: 'Terep',
    minHeadcount: 'Minimális létszám',
    optHeadcount: 'Ajánlott létszám',
    maxHeadcount: 'Maximális létszám',
    coordinates: 'Koordináták',
    ctaText: 'Szeretnéd lefoglalni ezt a pályát a csapatodnak?',
  },

  map: {
    overviewAria: 'Pályáink térképe az Alföldön',
    venueAria: 'Térkép: {city}, {venue}',
    loading: 'Térkép betöltése…',
    error: 'A térkép nem jeleníthető meg ebben a böngészőben.',
    errorList: 'A pályákat a listából továbbra is kiválaszthatod.',
    listAria: 'Pályák listája',
    listEyebrow: 'Helyszínek',
    venueCount: '{count} pálya',
    placeCount: '{count} helyszín',
    clusterLabel: '{city} – {count} helyszín, kattints a nagyításhoz',
  },

  booking: {
    metaTitle: 'Időpont foglalás – Paintball és lézertag',
    metaDescription:
      'Foglald le paintball vagy lézertag időpontodat. Válassz pályát és időpontot, és foglalj online pár perc alatt, vagy keress minket telefonon vagy e-mailben.',
    eyebrow: 'Foglalás',
    title: 'Időpont foglalása',
    lead: 'Válassz pályát, időpontot és létszámot, és pár perc alatt elküldheted a foglalásod. Inkább beszélnél velünk? Telefonon és e-mailben is foglalhatsz.',
    noticeImportant: 'Fontos:',
    noticeBefore: 'előzetes időpontfoglalás szükséges, lehetőleg legalább',
    noticeStrong: 'egy héttel a tervezett játék előtt',
    noticeAfter: ', hogy a pályát és a felszerelést garantálni tudjuk.',
    formLoading: 'Foglalási űrlap betöltése…',
    altTitle: 'Inkább telefonon vagy e-mailben?',
    altHint:
      'Telefonon vagy e-mailben írd meg a tervezett dátumot, a létszámot és a választott pályát, így azonnal pontos ajánlatot tudunk adni.',

    stepsAria: 'Foglalás lépései',
    stepOf: '{current}. lépés / {total}',
    steps: {
      venue: { label: 'Pálya', title: 'Melyik pályán játszanátok?' },
      slot: { label: 'Időpont', title: 'Mikor jönnétek?' },
      group: { label: 'Létszám', title: 'Hányan lesztek?' },
      contact: { label: 'Adatok', title: 'Kapcsolattartó adatai' },
      summary: { label: 'Összegzés', title: 'Ellenőrizd és küldd el' },
    },
    venuesLoading: 'Pályák betöltése…',
    venuesError: 'Nem sikerült betölteni a pályákat. Próbáld újra, vagy foglalj telefonon:',
    sendFailed: 'Nem sikerült elküldeni a foglalást. Próbáld újra, vagy hívj minket:',
    back: 'Vissza',
    next: 'Tovább',
    pickVenueHint: 'Válassz egy pályát a folytatáshoz.',
    sending: 'Küldés…',
    send: 'Foglalás elküldése',

    date: 'Dátum',
    dateHint: 'Online legalább egy héttel előre lehet foglalni.',
    startTime: 'Kezdési időpont (2 órás játék)',
    slotsLoading: 'Szabad időpontok betöltése…',
    slotsError: 'Nem sikerült betölteni a szabad időpontokat.',
    dayNotBookable: 'Erre a napra online nem lehet foglalni. Hívj minket:',
    dayFull: 'Ezen a napon minden időpont foglalt. Válassz másik napot, vagy hívj minket.',
    slotTaken: 'foglalt',
    slotRecommended: 'ajánlott',
    slotsRecommendedHint: 'Az ajánlott időpontok illeszkednek a csapatunk aznapi útvonalához.',

    headcount: 'Létszám (fő)',
    headcountHint: 'Ezen a pályán {min}–{max} fő játszhat egyszerre.',
    note: 'Megjegyzés (nem kötelező)',
    notePlaceholder: 'Pl. születésnap, céges csapatépítő, kért kiegészítő program…',
    noteCount: '{count} / {max} karakter',

    name: 'Teljes név',
    namePlaceholder: 'Pl. Szabó János',
    email: 'E-mail cím',
    emailPlaceholder: 'Pl. janos@pelda.hu',
    phone: 'Telefonszám',
    phonePlaceholder: 'Pl. +36 30 123 4567',

    summaryVenue: 'Pálya',
    summaryTime: 'Időpont',
    summaryHeadcount: 'Létszám',
    summaryNote: 'Megjegyzés',
    summaryContact: 'Kapcsolattartó',
    summaryPayment: 'Fizetés',
    summaryPaymentText: 'Helyszínen fizetendő. Az árat a foglalás visszaigazolásakor pontosítjuk.',

    doneTitle: 'Foglalásodat megkaptuk',
    doneNumber: 'Foglalási szám:',
    doneStatus: 'Állapot:',
    donePending: 'függőben',
    doneStatusText: '. Kollégánk hamarosan visszaigazolja a foglalást e-mailben vagy telefonon.',
    doneAgain: 'Új foglalás',

    errors: {
      venueRequired: 'Válassz pályát.',
      dateRequired: 'Válassz dátumot.',
      tooSoon:
        'Online legalább {days} nappal előre lehet foglalni. Rövidebb határidőre hívj minket telefonon.',
      tooLate: 'Erre a dátumra még nem lehet foglalni.',
      timeRequired: 'Válassz időpontot.',
      headcountRequired: 'Add meg a létszámot.',
      wholeNumber: 'A létszám egész szám legyen.',
      headcountMin: 'Ezen a pályán legalább {min} fő játszhat.',
      headcountMax: 'Ezen a pályán legfeljebb {max} fő játszhat.',
      noteTooLong: 'A megjegyzés legfeljebb {maxLength} karakter.',
      nameRequired: 'Add meg a neved.',
      nameTooLong: 'Legfeljebb {maxLength} karakter.',
      emailRequired: 'Add meg az e-mail címed.',
      emailInvalid: 'Érvénytelen e-mail cím.',
      phoneRequired: 'Add meg a telefonszámod.',
      phoneInvalid: 'Érvénytelen telefonszám.',
      invalid: 'Hibás érték.',
      sendFailed: 'A foglalást nem sikerült elküldeni.',
    },
  },

  /** Texts of the venue pages, keyed by route slug. */
  venues: {
    szeged: {
      venue: 'Boszorkánysziget',
      title: 'Szeged Paintball Pálya - Boszorkánysziget | Paintball Alföldön',
      metaDesc:
        'Paintball Szegeden a Tisza-parti Boszorkánysziget ősfás, vadregényes erdejében. Könnyen megközelíthető, taktikai pálya 24-150 főre.',
      address: 'Szeged, Boszorkánysziget (a vasútállomástól ~1 km-re)',
      terrainType: 'Természetes erdős terep ősfákkal',
      description:
        'A szegedi Boszorkánysziget ideális helyszín a paintball kedvelőinek. A Tisza-parti ligetes erdő természetes fedezékeivel, ősfáival és a kiépített taktikai akadályokkal igazi katonai küldetés hangulatát idézi. Mindössze 1 km-re található a vasútállomástól, így városon belülről is gyorsan és könnyen elérhető akár gyalogosan vagy kerékpárral is.',
    },
    'szeged-csarnok': {
      venue: 'Katonai csarnok',
      title: 'Szeged Indoor Paintball - Katonai Csarnok | Paintball Alföldön',
      metaDesc:
        'Indoor paintball és lézertag Szegeden. 2000 m²-es egykori katonai csarnok épület akadályokkal, CQB harctérrel.',
      address: 'Szeged, Külterületi ipari zóna (egykori laktanya épület)',
      terrainType: '2000 m²-es fedett katonai csarnok épület',
      description:
        'Szegedi második helyszínünk egy hatalmas, 2000 négyzetméteres egykori katonai csarnok és raktárépület. A teljesen zárt, időjárásálló beltéri harctéren falak, helyiségek, katonai járműroncsok és mesterséges fedezékek biztosítják a CQB (közeli harc) élményét. Kitűnő választás esős időben, téli időszakban, illetve izgalmas paintball, intenzív airsoft és lézertag összecsapásokhoz.',
    },
    szentes: {
      venue: 'Rekreációs zóna',
      title: 'Szentes Paintball és Szabadidő Pálya | Paintball Alföldön',
      metaDesc:
        'Paintball Szentes területén. Taktikai akadályok, dús növényzet és kiváló hangulat baráti társaságoknak és csapatépítőknek.',
      address: 'Szentes, Külterületi rekreációs zóna (részletek egyeztetés szerint)',
      terrainType: 'Füves-fás vegyes terep mesterséges fedezékekkel',
      description:
        '[TODO: Szentesi részletes pálya adatok feltöltése.] Szentesi szabadtéri pályánk ideális helyszín kisebb és közepes méretű csapatok számára. A vegyes növényzet és a gondosan elhelyezett mesterséges fedezékek kiváló lehetőséget biztosítanak a taktikai játékokhoz, rekreációs programokhoz. Baráti társaságok és kisebb cégek számára egyaránt kitűnő választás.',
    },
    szolnok: {
      venue: 'Tiszaliget',
      title: 'Szolnok Paintball Pálya - Tiszaliget (Indoor) | Paintball Alföldön',
      metaDesc:
        'Szolnoki indoor paintball a Tiszaligeti Ifjúsági Tábor fedett épületeiben. Kiválóan alkalmas csapatépítőkre és diákcsoportoknak.',
      address: 'Szolnok, Tiszaliget sétány (az Ifjúsági Tábor fedett épületeiben)',
      terrainType: 'Fedett csarnok és épületek',
      description:
        'A szolnoki Tiszaliget az Ifjúsági Tábor területén fekszik, és kiválóan alkalmas beltéri paintball csaták lebonyolítására. A kiépített fedett csarnokok, szobák és folyosók időjárástól független, pörgős CQB (közeli harc) stílusú küldetéseket tesznek lehetővé. Diákcsoportok és céges csapatépítők számára is első osztályú választás.',
    },
    kecskemet: {
      venue: 'Homokbánya',
      title: 'Kecskemét Indoor Paintball - Homokbánya | Paintball Alföldön',
      metaDesc:
        'Kecskeméti indoor paintball a Homokbányánál, a Decathlon mellett. 5000 m²-es, többszintes fedett pálya az M5-östől 3 percre.',
      address: 'Kecskemét, Téglás utca 8. (a Decathlon mellett)',
      terrainType: '5000 m²-es fedett, többszintes épület',
      description:
        'Kecskeméti helyszínünk a régió egyik legnagyobb fedett (indoor) paintball komplexuma. Az 5000 négyzetméteres, többszintes épület az M5-ös autópálya lehajtójától mindössze 3 percre található. Az időjárástól független, izgalmas szobák, folyosók és lépcsőházak tökéletes terepet biztosítanak a CQB (közeli harc) stílusú összecsapásokhoz.',
    },
    bekescsaba: {
      venue: 'Póstelek',
      title: 'Békéscsaba Paintball Pálya - Póstelek | Paintball Alföldön',
      metaDesc:
        'Békéscsabai paintball Pósteleken. Több hektáros erdős pálya, izgalmas szintkülönbségek, dombok és gödrök a természet lágyán.',
      address: 'Békéscsaba, Pósteleki erdő',
      terrainType: 'Több hektáros erdős pálya dombokkal és gödrökkel',
      description:
        'A békéscsabai pálya a pósteleki erdőben található, kiterjedt erdei környezetben. A terep különlegességét a természetes és mesterséges szintkülönbségek adják: dombok, lövészárkok és mélyedések szabdalják a pályát, ami különleges taktikai mélységet ad a játéknak. Ideális választás azoknak, akik szeretik a természet közelségét és a terepviszonyok adta kihívásokat.',
    },
    oroshaza: {
      venue: 'Volt katonai gyakorlótér',
      title: 'Orosháza Paintball Pálya - Volt Katonai Gyakorlótér | Paintball Alföldön',
      metaDesc:
        'Paintball Orosházán a volt katonai gyakorlópályán. Lőárkok, dombok és elszigetelt katonai terület, akár 1000+ fős óriásrendezvényekre.',
      address: 'Orosháza, Volt katonai gyakorlópálya',
      terrainType: 'Volt katonai gyakorlótér lőárkokkal és bunkerekkel',
      description:
        'Az orosházi pálya egy valódi volt katonai gyakorlópályán kapott helyet. A hatalmas, elszigetelt területen lőárkok, fedezékek és dombok találhatók. Eredeti katonai jellegéből adódóan rendkívül hangulatos és alkalmas akár 1000 főt meghaladó óriásrendezvények, nagy létszámú céges fesztiválok vagy paintball találkozók lebonyolítására is.',
    },
  },
};

/** Shape every language file must match. */
export type Translations = typeof hu;
