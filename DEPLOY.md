# Deploy pe Coolify

## Configurare rapidă (2 minute)

1. **Coolify → New Resource → Public/Private Repository**
2. Introdu URL-ul repository-ului Git (ex: `https://github.com/thesaintcompany/League`).
3. **Build Pack: Dockerfile** (recomandat) sau **Nixpacks**.
4. **Port: 3000**.
5. **Persistent Storage** → Adaugă volum:
   - Destination Path: `/app/data`
   - Size: `1GB` (sau după preferințe)
6. Variabile de mediu necesare pentru autentificare:
   - `DATABASE_URL` = `file:/app/data/league.db` (setat automat implicit)
   - `ADMIN_EMAIL` = adresa ta de email (pentru contul de admin inițial)
   - `ADMIN_PASSWORD` = parola ta de admin (minim 8 caractere)
   - `NEXTAUTH_URL` = `https://ligue.ro` (presetat implicit; fără `localhost`)
   - `NEXTAUTH_SECRET` = un string secret aleatoriu de minim 32 caractere (ex: generat cu `openssl rand -base64 32`)
7. Click pe **Deploy**.

---

## Autentificare implicită (dacă nu ai setat ADMIN_EMAIL/PASSWORD)

La prima pornire, aplicația creează automat două conturi de test:

| Email                   | Parolă            | Rol                         |
| ----------------------- | ----------------- | --------------------------- |
| `admin@leaguehub.local` | `superadmin12345` | Administrator (Super Admin) |

De asemenea, este creat campionatul demonstrativ **"Liga Demo 2026"** cu echipe și meciuri de start.

---

## Cum funcționează persistența bazei de date

- Baza de date SQLite este stocată în `/app/data/league.db`.
- Volumul persistent montat la `/app/data` păstrează toate datele (utilizatori, campionate, meciuri, scoruri) la fiecare redeploy / restart.
- Scriptul de bootstrap rulează automat `prisma db push` la pornire, fiind 100% idempotent (doar adaugă tabele/coloane noi fără a șterge datele existente).

---

## Cum resetezi baza de date

1. Coolify → Aplicația ta → **Persistent Storage** → șterge conținutul sau volumul `/app/data`.
2. Dă **Redeploy**.
3. Bootstrap-ul va recrea automat schema și datele demonstrative.

---

## Contact & Suport

- **Email  :** `contact@ligue.ro` (Datele de contact sunt exclusiv `contact@ligue.ro` și sunt definitive)
