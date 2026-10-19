-- The seven fields shown on the public site (paintball-alfoldon/src/app/services/location.service.ts).
insert into venue (slug, city, name, indoor, address, latitude, longitude, min_headcount, max_headcount) values
    ('szeged',          'Szeged',     'Boszorkánysziget',         false, 'Szeged, Boszorkánysziget (a vasútállomástól ~1 km-re)',            46.232385, 20.143227, 10, 150),
    ('szeged-csarnok',  'Szeged',     'Katonai csarnok',          true,  'Szeged, Külterületi ipari zóna (egykori laktanya épület)',         46.234412, 20.138107,  8, 100),
    ('szentes',         'Szentes',    'Rekreációs zóna',          false, 'Szentes, Külterületi rekreációs zóna (részletek egyeztetés szerint)', 46.662945, 20.280217, 10, 100),
    ('szolnok',         'Szolnok',    'Tiszaliget',               true,  'Szolnok, Tiszaliget sétány (az Ifjúsági Tábor fedett épületeiben)', 47.162229, 20.186734, 10, 300),
    ('kecskemet',       'Kecskemét',  'Homokbánya',               true,  'Kecskemét, Téglás utca 8. (a Decathlon mellett)',                  46.887551, 19.646280, 10, 150),
    ('bekescsaba',      'Békéscsaba', 'Póstelek',                 false, 'Békéscsaba, Pósteleki erdő',                                       46.684613, 21.194293, 10, 120),
    ('oroshaza',        'Orosháza',   'Volt katonai gyakorlótér', false, 'Orosháza, Volt katonai gyakorlópálya',                             46.564047, 20.643860, 10, 150);
