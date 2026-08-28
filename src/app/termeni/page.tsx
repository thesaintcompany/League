import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const metadata = {
  title: "Termeni și Condiții de Utilizare • PRO LIGUE ROMÂNIA",
  description:
    "Termenii și condițiile oficiale de utilizare a platformei PRO LIGUE (ligue.ro). Gratuitate 1 campionat/user și 1 echipă/lider; administrarea de evenimente și echipe suplimentare taxată conform tarifelor afișate. Operator: TSC QUANTUM S.R.L.",
};

export default function TermeniPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-body transition-colors duration-200">
      <PublicHeader />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-5 relative z-10 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-lime-400 text-slate-950 text-xs font-headline font-black uppercase tracking-wider shadow-sm">
              <span className="material-symbols-outlined text-sm">gavel</span> CADRU LEGAL &amp; CONTRACTUAL
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700">
              CUI: 53063735 • J2025095153006
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-label">
              Actualizat: Sezon 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-tight text-slate-900 dark:text-white">
            Termeni și Condiții de Utilizare
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed font-body">
            Regulamentul oficial de funcționare, organizare competițională și tarifare al platformei naționale{" "}
            <strong className="text-slate-900 dark:text-white">PRO LIGUE ROMÂNIA</strong> (disponibilă la adresa web{" "}
            <a href="https://ligue.ro" className="text-lime-600 dark:text-lime-400 hover:underline font-bold">
              ligue.ro
            </a>
            ), deținută și operată de societatea comercială{" "}
            <strong className="text-slate-900 dark:text-white">TSC QUANTUM S.R.L.</strong>
          </p>
        </div>
      </section>

      {/* Bento Highlights Bar: Gratuități & Tarife */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-lime-400/20 text-lime-600 dark:text-lime-400 flex items-center justify-center shrink-0 border border-lime-400/30">
              <span className="material-symbols-outlined text-xl">emoji_events</span>
            </div>
            <div>
              <span className="text-xs font-black font-headline uppercase tracking-wider text-slate-900 dark:text-white block">
                1 Campionat Gratuit
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug block mt-0.5">
                Inclus gratuit pentru fiecare utilizator organizator
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-400/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-400/30">
              <span className="material-symbols-outlined text-xl">groups</span>
            </div>
            <div>
              <span className="text-xs font-black font-headline uppercase tracking-wider text-slate-900 dark:text-white block">
                1 Echipă Gratuită
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug block mt-0.5">
                Inclusă gratuit pentru fiecare lider de echipă
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <div>
              <span className="text-xs font-black font-headline uppercase tracking-wider text-slate-900 dark:text-white block">
                Tarife Suplimentare
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug block mt-0.5">
                Evenimentele și echipele extra se taxează conform prețurilor afișate
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-400/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-400/30">
              <span className="material-symbols-outlined text-xl">verified</span>
            </div>
            <div>
              <span className="text-xs font-black font-headline uppercase tracking-wider text-slate-900 dark:text-white block">
                Operator Înregistrat
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug block mt-0.5">
                TSC QUANTUM S.R.L. • Timișoara, RO
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Legal Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        <div className="card p-6 sm:p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-10 shadow-sm text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">

          {/* Secțiunea Specială: Gratuitate și Model de Tarifare */}
          <section className="p-6 sm:p-8 rounded-3xl bg-lime-400/10 dark:bg-lime-400/5 border-2 border-lime-400/40 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-6 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-xl font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                POLITICA DE GRATUITATE &amp; TARIFE OFICIALE
              </h2>
            </div>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-body">
              Platforma PRO LIGUE sprijină dezvoltarea sportului de masă și a comunităților sportive din România printr-un model hibrid transparent de acces:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-lime-400/30 space-y-2">
                <div className="flex items-center gap-2 text-lime-600 dark:text-lime-400 font-bold font-headline text-xs uppercase">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Pachet Gratuit Organizator (Free Tier)
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Fiecare utilizator înregistrat cu rolul de <strong>Organizator</strong> beneficiază de dreptul de a crea și administra <strong>GRATUIT un (1) campionat</strong> complet (inclusiv calendar meciuri, clasamente oficiale, tragere la sorți cu zaruri 3D și statistici de meci).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-lime-400/30 space-y-2">
                <div className="flex items-center gap-2 text-lime-600 dark:text-lime-400 font-bold font-headline text-xs uppercase">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Pachet Gratuit Lider Echipă (Free Tier)
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Fiecare utilizator înregistrat cu rolul de <strong>Lider de Echipă (Manager / Căpitan)</strong> beneficiază de dreptul de a înscrie și gestiona <strong>GRATUIT o (1) echipă</strong> (inclusiv lot de jucători, statistici sportive, legitimare și prezențe la arene).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-400/10 dark:bg-amber-400/5 border border-amber-400/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold font-headline text-xs uppercase">
                <span className="material-symbols-outlined text-base">payments</span>
                Taxarea Grupurilor de Evenimente și a Echipelor Suplimentare
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                <strong>Orice administrare de grupuri de evenimente, turnee suplimentare sau echipe adiționale</strong> care depășește limita gratuită inclusă <strong>va fi taxată conform prețurilor și tarifelor afișate în platformă</strong> la momentul creării sau activării (de exemplu, taxa standard de abonament pentru fiecare echipă suplimentară de 60 EUR/an sau pachetele dedicate pentru ligi multi-divizie). Activarea serviciilor suplimentare se realizează imediat după confirmarea plății electronice securizate.
              </p>
            </div>
          </section>

          {/* Articolul 1 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 1. Identificarea Operatorului și Acceptarea Termenilor
              </h2>
            </div>
            <p>
              Platforma PRO LIGUE (accesibilă pe domeniul web principal <strong>ligue.ro</strong> și subdomeniile asociate) este proprietatea exclusivă și este administrată de societatea:
            </p>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-1 text-slate-800 dark:text-slate-200">
              <p><strong className="text-slate-950 dark:text-white">Denumire societate:</strong> TSC QUANTUM S.R.L.</p>
              <p><strong className="text-slate-950 dark:text-white">Cod Unic de Înregistrare (CUI):</strong> 53063735</p>
              <p><strong className="text-slate-950 dark:text-white">Număr Înregistrare Registrul Comerțului:</strong> J2025095153006</p>
              <p><strong className="text-slate-950 dark:text-white">Sediul Social:</strong> Timișoara, Județul Timiș, România</p>
              <p><strong className="text-slate-950 dark:text-white">Contact Suport &amp; Legal:</strong> contact@ligue.ro</p>
            </div>
            <p>
              Prin crearea unui cont, accesarea platformei, înscrierea unei echipe, organizarea unui campionat sau achiziționarea unui bilet electronic, utilizatorul își exprimă acordul expres, necondiționat și integral cu privire la acești Termeni și Condiții, precum și cu{" "}
              <Link href="/confidentialitate" className="text-lime-600 dark:text-lime-400 font-bold hover:underline">
                Politica de Confidențialitate (GDPR)
              </Link>
              . Dacă nu sunteți de acord cu prezentele dispoziții, aveți obligația de a înceta de îndată utilizarea platformei.
            </p>
          </section>

          {/* Articolul 2 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 2. Rolurile Utilizatorilor și Drepturile de Acces
              </h2>
            </div>
            <p>
              Platforma PRO LIGUE deservește comunități sportive prin intermediul a 5 categorii principale de utilizatori:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Organizatori de Campionate:</strong> Utilizatori responsabili de configurarea ligilor, stabilirea arenelor de joc, regulamentelor specifice și omologarea rezultatelor.
              </li>
              <li>
                <strong>Lideri de Echipă (Manageri / Căpitani):</strong> Utilizatori împuterniciți să înscrie loturi de jucători, să desemneze numerele de tricou și să confirme prezența la meciuri.
              </li>
              <li>
                <strong>Arbitri Oficiali Omologați:</strong> Oficiali de joc desemnați să conducă meciurile, să înregistreze evenimentele în timp real (goluri, avertismente, faulturi) și să semneze digital raportul oficial de meci.
              </li>
              <li>
                <strong>Proprietari / Administratori de Arene:</strong> Persoane juridice sau fizice care gestionează bazele sportive, definesc capacitatea tribunelor și confirmă sloturile de joc.
              </li>
              <li>
                <strong>Jucători &amp; Spectatori:</strong> Membri sportivi și suporteri care urmăresc clasamentele, cumpără bilete electronice și participă la meciuri în calitate de spectatori.
              </li>
            </ul>
          </section>

          {/* Articolul 3 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 3. Condiții Financiare, Abonamente &amp; Plăți
              </h2>
            </div>
            <p>
              Pentru utilizarea serviciilor comerciale din cadrul PRO LIGUE se aplică următoarele reguli:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Plafonul Gratuit:</strong> Gratuitatea de 1 campionat per organizator și 1 echipă per lider este garantată pe viață pentru conturile individuale active, în limitele utilizării normale de fair-play.
              </li>
              <li>
                <strong>Tarifele pentru Pachete și Servicii Extra:</strong> Gestionarea unor divizii multiple, turnee paralele sau echipe suplimentare în cadrul aceluiași club se facturează conform tarifelor afișate în mod transparent în panoul de administrare (ex: modulul de plată a abonamentului de echipă de 60 EUR/an sau pachete de organizare corporate).
              </li>
              <li>
                <strong>Procesarea Plăților:</strong> Plățile sunt procesate în regim securizat prin procesatori autorizați internațional (Stripe, PayPal, Apple Pay, Google Pay). TSC QUANTUM S.R.L. emite factură fiscală electronică pentru fiecare tranzacție efectuată.
              </li>
              <li>
                <strong>Renunțare și Rambursare:</strong> Serviciile digitale activate imediat (deblocarea creării de echipe/campionate sau emiterea biletelor electronice) sunt exceptate de la dreptul de retragere după prestarea completă a serviciului, conform art. 16 lit. m din OUG nr. 34/2014.
              </li>
            </ul>
          </section>

          {/* Articolul 4 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 4. Regulamentul Tragerilor la Sorți (Algoritm 3D)
              </h2>
            </div>
            <p>
              Pentru stabilirea programului etapelor și a tablourilor eliminatorii, platforma pune la dispoziție un simulator fizic 3D de aruncare a zarurilor:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Organizatorul poate utiliza simulatorul pentru cel mult <strong>trei (3) aruncări consecutive</strong> înainte de publicarea oficială a tabloului competițional.
              </li>
              <li>
                După apăsarea butonului de publicare oficială („Publică Tabloul de Joc”), arborele competițional devine <strong>definitiv și blocat</strong> pentru a preveni vicierea competiției și favorizarea vreunui participant.
              </li>
              <li>
                Modificările excepționale ulterioare se pot realiza exclusiv prin raport scris și motivat adresat comisiei tehnice la <code>contact@ligue.ro</code>.
              </li>
            </ul>
          </section>

          {/* Articolul 5 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 5. Serviciul de Ticketing &amp; Acces la Arene
              </h2>
            </div>
            <p>
              Biletele emise prin intermediul PRO LIGUE sunt documente electronice nominale securizate criptografic prin coduri QR unice:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Fiecare cod QR permite o singură scanare validă la porțile de acces ale arenei sportive.</li>
              <li>Spectatorii au obligația de a prezenta biletul în format digital (pe ecranul telefonului) sau tipărit pe hârtie.</li>
              <li>În cazul amânării sau reprogramării unei partide din motive meteo sau forță majoră, biletul rămâne valabil automat pentru data reprogramată.</li>
              <li>Politica de rambursare a biletelor în caz de anulare definitivă a evenimentului este asigurată conform legislației protecției consumatorului.</li>
            </ul>
          </section>

          {/* Articolul 6 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 6. Conduită Sportivă, Fair-Play &amp; Sancțiuni
              </h2>
            </div>
            <p>
              Toți utilizatorii (jucători, manageri, arbitri și spectatori) au obligația de a respecta normele fundamentale de etică și fair-play:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Sunt strict interzise manifestările de rasism, xenofobie, violență fizică sau verbală la arenele de joc.</li>
              <li>Frauda identității (folosirea de jucători pe fals sau nelegitimați conform regulamentului) atrage pierderea meciului prin forfait și blocarea accesului echipei vinovate.</li>
              <li>TSC QUANTUM S.R.L. își rezervă dreptul de a suspenda sau închide definitiv conturile care încalcă în mod repetat regulamentul platformei sau principiile eticii sportive.</li>
            </ul>
          </section>

          {/* Articolul 7 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 7. Proprietate Intelectuală
              </h2>
            </div>
            <p>
              Întregul conținut al platformei PRO LIGUE (inclusiv siglele, mărcile comerciale înregistrate, designul grafic, denumirile de competiții, algoritmii de calcul ai clasamentelor și codul sursă) reprezintă proprietatea intelectuală exclusivă a <strong>TSC QUANTUM S.R.L.</strong> și este protejat de Legea nr. 8/1996 privind dreptul de autor și drepturile conexe.
            </p>
            <p>
              Copierea, decompilarea, multiplicarea neautorizată sau extragerea masivă de date (scraping) fără acordul scris prealabil al TSC QUANTUM S.R.L. sunt strict interzise și atrag răspunderea civilă și penală.
            </p>
          </section>

          {/* Articolul 8 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 8. Limitarea Răspunderii
              </h2>
            </div>
            <p>
              TSC QUANTUM S.R.L. depune toate eforturile rezonabile pentru a asigura disponibilitatea continuă și funcționarea impecabilă a platformei. Cu toate acestea:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Platforma este pusă la dispoziție pe baza principiului „așa cum este” („as is”), fără garanții implicite privind compatibilitatea cu anumite echipamente specifice.</li>
              <li>Operatorul nu este răspunzător pentru deciziile tehnice de joc luate de arbitri sau organizatori pe terenul de sport, acestea aparținând exclusiv corpului de arbitri și comisiilor abilitate.</li>
              <li>Operatorul nu răspunde pentru întreruperi cauzate de forță majoră, defecțiuni ale furnizorilor externi de telecomunicații sau atacuri cibernetice masive neimputabile societății.</li>
            </ul>
          </section>

          {/* Articolul 9 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 9. Legea Aplicabilă și Jurisdicția
              </h2>
            </div>
            <p>
              Prezenții Termeni și Condiții sunt guvernați de legea română și normele europene aplicabile. Orice litigiu apărut între utilizatori și TSC QUANTUM S.R.L. va fi soluționat pe cale amiabilă. În caz de imposibilitate a unei înțelegeri amiabile, competența de soluționare aparține instanțelor judecătorești competente de la sediul operatorului din Timișoara, Județul Timiș, România.
            </p>
          </section>

          {/* Articolul 10 */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 10. Date de Contact Oficial
              </h2>
            </div>
            <p>
              Pentru orice întrebări, sesizări sau solicitări de parteneriat legate de acești Termeni și Condiții, vă rugăm să ne contactați:
            </p>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-lime-600 dark:text-lime-400 font-bold font-headline text-xs uppercase">
                <span className="material-symbols-outlined text-base">support_agent</span>
                Departamentul Juridic &amp; Suport Clienți
              </div>
              <p className="font-bold text-slate-900 dark:text-white">TSC QUANTUM S.R.L. • PRO LIGUE ROMÂNIA</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Timișoara, Județul Timiș, România • CUI: 53063735</p>
              <p className="text-xs">
                E-mail:{" "}
                <a href="mailto:contact@ligue.ro" className="text-lime-600 dark:text-lime-400 font-bold hover:underline">
                  contact@ligue.ro
                </a>
              </p>
            </div>
          </section>

          {/* Bottom Nav Actions */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
            <Link
              href="/confidentialitate"
              className="text-xs font-headline font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-base">verified_user</span> Politica de Confidențialitate (GDPR)
            </Link>

            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl bg-lime-400 text-slate-950 hover:bg-lime-300 text-xs font-headline font-black uppercase tracking-wider shadow-sm transition flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">sports_soccer</span> Creează Cont Gratuit
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
