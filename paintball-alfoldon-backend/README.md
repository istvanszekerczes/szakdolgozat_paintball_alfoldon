# Paintball Alföldön – backend

Spring Boot 4 (Java 21) REST API PostgreSQL adatbázissal. Ezt hívja a nyilvános weboldal
(`paintball-alfoldon.hu`) és a külön domainen futó admin dashboard (`admin.paintball-alfoldon.hu`).

## Futtatás fejlesztéskor

```bash
docker compose up -d      # PostgreSQL a localhost:5432-n (paintball / paintball)
./gradlew bootRun         # API a localhost:8080-on, "dev" profillal
./gradlew test            # tesztek (H2 memóriaadatbázissal, Docker nem kell)
```

A `dev` profil (`application-dev.properties`) első induláskor létrehoz egy `admin` / `admin` felhasználót.
Az adatbázis sémáját a Flyway hozza létre és tölti fel a 7 pályával (`src/main/resources/db/migration`).

## Felépítés

Funkciók szerinti csomagok a `com.paintball.app` alatt:

| Csomag     | Tartalom |
|------------|----------|
| `venue`    | Pályák (koordinátákkal a térképhez), nyilvános lekérdezés és szabad időpontok |
| `booking`  | Foglalás entitás, foglalási szabályok (`BookingRules`), nyilvános és admin végpontok |
| `customer` | Foglaló ügyfelek (e-mail alapján azonosítva) |
| `auth`     | Admin felhasználók, bejelentkezés, JWT kiadás |
| `config`   | Biztonság és CORS, beállítások (`AppProperties`), óra |
| `common`   | Hibakezelés: egységes (RFC 9457) hibaválaszok |

Rétegek: controller → service → repository (Spring Data JPA). A controllerek DTO-kat (recordokat)
adnak vissza, entitást soha.

## Végpontok

Nyilvános (a weboldal hívja):

| Metódus | Útvonal | Leírás |
|---------|---------|--------|
| GET  | `/api/venues` | Aktív pályák listája koordinátákkal |
| GET  | `/api/venues/{slug}` | Egy pálya |
| GET  | `/api/venues/{slug}/availability?date=2026-11-10` | Az adott nap idősávjai, szabad-e |
| POST | `/api/bookings` | Foglalás leadása (függő állapotban jön létre) |

Admin (a dashboard hívja, `Authorization: Bearer <token>` fejléc kell):

| Metódus | Útvonal | Leírás |
|---------|---------|--------|
| POST  | `/api/admin/auth/login` | Bejelentkezés, tokent ad vissza |
| GET   | `/api/admin/bookings?venue=&from=&to=&status=` | Foglalások szűrve |
| GET   | `/api/admin/bookings/{id}` | Egy foglalás az ügyfél adataival |
| PATCH | `/api/admin/bookings/{id}/status` | Állapot módosítása: `{"status":"ACCEPTED"}` |

Állapotok: `PENDING` → `ACCEPTED` vagy `REJECTED`; `ACCEPTED` → `CANCELLED`.

## Foglalási szabályok (alapértelmezések, `application.properties`-ben állíthatók)

- Fix 2 órás idősávok 8:00 és 20:00 között.
- Pályánként és idősávonként egy csoport; a függő és az elfogadott foglalás is foglaltnak számít.
- Online legalább 7 nappal előre, legfeljebb 365 nappal előre lehet foglalni.
- A létszám a pálya minimuma és maximuma között lehet.
- Egyidejű foglalásnál a pálya sorát zárolja a rendszer, így ugyanarra a sávra csak egy foglalás jöhet létre.

## Biztonság és domainek

- `/api/admin/**` csak admin tokennel érhető el, minden más `/api/**` nyilvános.
- CORS: a nyilvános végpontokat csak a weboldal domainje, az admin végpontokat csak a dashboard
  domainje hívhatja böngészőből. Így a vásárlói oldalról az admin felület nem érhető el.
- A token a dashboardon az `Authorization` fejlécben megy, nem sütiben, ezért CSRF védelem nem kell.

## Éles beállítások (környezeti változók)

| Változó | Leírás |
|---------|--------|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL elérés |
| `JWT_SECRET` | Legalább 32 karakteres titok az admin tokenek aláírásához |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Első admin felhasználó, ha még nincs egy sem |
| `CORS_PUBLIC_ORIGINS` | Alapértelmezés: `https://paintball-alfoldon.hu,https://www.paintball-alfoldon.hu` |
| `CORS_ADMIN_ORIGINS` | Alapértelmezés: `https://admin.paintball-alfoldon.hu` |
