# LeagueHub — Sport League Organizer

Webapp complet pentru organizarea de campionate, ligi și competiții sportive de echipă
(fotbal, baschet, handbal, volei, etc.). Creezi campionate, adaugi echipe și jucători,
programezi meciuri și urmărești clasamentul live.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** pentru UI
- **Prisma** + **SQLite** (zero-config, perfect pentru Hestia/Coolify)
- **NextAuth** (email + parolă)
- **bcryptjs** pentru hash parole

## Funcționalități (MVP)

- Sign up / sign in (email + parolă)
- Dashboard cu toate campionatele tale
- Creare campionat (sport, format, sezon, perioadă)
- Adăugare echipe (nume, culoare, logo)
- Adăugare jucători pe echipă
- Programare meciuri (data, locație, rundă)
- Status meci: scheduled / live / finished
- Scor live + clasament calculat automat (3 puncte victorie, 1 egal)

## Dezvoltare locală

```bash
# 1. Instalează Node.js 20+ de la https://nodejs.org

# 2. Instalează dependențele
cd sport-league-organizer
cp .env.example .env
# Editează .env și pune un NEXTAUTH_SECRET lung (min 32 caractere)
# Generează unul cu: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 3. Setup DB + seed
npm install
npm run prisma:push      # creează tabelele
npm run prisma:seed      # populează cu date demo

# 4. Pornește
npm run dev              # http://localhost:3000
```

**Login admin:** `admin@leaguehub.local` / `superadmin12345`

## Build de producție

```bash
npm run build
npm run start
```

## Deploy pe HestiaCP

HestiaCP folosește Apache + Nginx ca reverse proxy. Pașii:

### 1. Pregătește serverul
- Conectează-te prin SSH ca userul care deține domeniul
- Asigură-te că ai **Node.js 20+**:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
  ```

### 2. Upload cod
- Copiază folderul `sport-league-organizer` pe server (SFTP, scp, git)
- Pune-l în `/home/<user>/<domeniu>/` (unde user e proprietarul domeniului în Hestia)

### 3. Configurare
```bash
cd /home/<user>/<domeniu>/sport-league-organizer
cp .env.example .env
nano .env
```
Setează:
```
DATABASE_URL="file:./prod.db"
NEXTAUTH_URL="https://domeniul-tau.ro"
NEXTAUTH_SECRET="<un-string-lung-random>"
```

### 4. Install + build
```bash
npm install
npx prisma generate
npx prisma db push
npm run build
```

### 5. Rulează cu PM2 (recomandat)
```bash
sudo npm install -g pm2
pm2 start npm --name "leaguehub" -- start
pm2 save
pm2 startup  # urmează instrucțiunile
```

### 6. Configurare Nginx în Hestia
- Deschide Hestia Web UI → domeniul tău → **Edit** → **Custom Nginx Settings**
- Adaugă un proxy_pass către `http://127.0.0.1:3000`

Sau direct în fișierul template:
```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

### 7. SSL
- Hestia are Let's Encrypt integrat → activează din Web UI

## Deploy pe Coolify (mai simplu)

Coolify suportă Next.js nativ, fără bătăi de cap:

1. **Push proiectul pe un Git repo** (GitHub, GitLab)
2. **În Coolify** → New Resource → Application → Public/Private Repository
3. **Build Pack:** Nixpacks (se auto-detectează)
4. **Port:** 3000
5. **Environment variables** (în Coolify UI):
   - `DATABASE_URL=file:./prod.db`
   - `NEXTAUTH_URL=https://domeniul-tau.ro`
   - `NEXTAUTH_SECRET=<generează-unul-lung>`
6. **Build command:** `npx prisma generate && npx prisma db push && npm run build`
7. **Start command:** `npm run start`
8. **Persistent storage:** montează un volum pe `./prisma` pentru a păstra baza de date între deploy-uri
9. **Deploy!** 🎉

## Structură

```
src/
├── app/
│   ├── api/             # API routes (auth, championships, teams, matches)
│   ├── dashboard/       # Pagini protejate (după login)
│   ├── signin/          # Login
│   ├── signup/          # Register
│   ├── profile/         # Profil user
│   ├── layout.tsx
│   ├── page.tsx         # Landing
│   └── globals.css
├── components/          # Componente UI (Navbar, Tabs, etc.)
└── lib/                 # Prisma, NextAuth config, utils
prisma/
├── schema.prisma        # Schema bazei de date
└── seed.ts              # Date demo
```

## API Endpoints (rezumat)

| Method       | Path                                           | Descriere                    |
| ------------ | ---------------------------------------------- | ---------------------------- |
| POST         | `/api/auth/signup`                             | Creare cont                  |
| GET/POST     | `/api/championships`                           | Lista / creare campionate    |
| GET/DELETE   | `/api/championships/:id`                       | Detalii / ștergere campionat |
| POST         | `/api/championships/:id/teams`                 | Adaugă echipă                |
| DELETE       | `/api/championships/:id/teams/:teamId`         | Șterge echipă                |
| POST         | `/api/championships/:id/teams/:teamId/players` | Adaugă jucător               |
| GET/POST     | `/api/championships/:id/matches`               | Lista / creare meciuri       |
| PATCH/DELETE | `/api/championships/:id/matches/:matchId`      | Update scor / ștergere       |
| GET          | `/api/championships/:id/standings`             | Clasament calculat           |

## Migrare la PostgreSQL (pentru producție serioasă)

SQLite e ok pentru 1-10 campionate mici. Dacă vrei multi-tenant sau volum mare:

1. În `prisma/schema.prisma` schimbă `provider = "sqlite"` → `provider = "postgresql"`
2. Setează `DATABASE_URL="postgresql://user:pass@host:5432/db"`
3. `npx prisma migrate dev` și `npx prisma db push`

## Date de Contact

- **Email   & Suport:** `contact@ ligue.ro` (Datele de contact sunt exclusiv `contact@ ligue.ro` și nu se mai modifică)
- **Website:** [https://sp. ligue.ro](https://sp. ligue.ro)

## Licență

MIT — fă ce vrei cu el.
