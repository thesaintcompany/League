import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const metadata = {
  title: "Politica de Confidențialitate & GDPR • PRO LIGUE ROMÂNIA",
  description:
    "Politica oficială privind protecția datelor cu caracter personal (GDPR - Regulamentul UE 2016/679). Operator: TSC QUANTUM S.R.L. (CUI 53063735, Timișoara).",
};

export default function ConfidentialitatePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-body transition-colors duration-200">
      <PublicHeader />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-5 relative z-10 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-lime-400 text-slate-950 text-xs font-headline font-black uppercase tracking-wider shadow-sm">
              <span className="material-symbols-outlined text-sm">verified_user</span> GDPR &amp; REGULAMENTUL (UE) 2016/679
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700">
              CUI: 53063735 • J2025095153006
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-label">
              Actualizat: Sezon 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-tight text-slate-900 dark:text-white">
            Politica de Confidențialitate
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed font-body">
            Protecția și securitatea datelor dumneavoastră cu caracter personal constituie o prioritate absolută pentru{" "}
            <strong className="text-slate-900 dark:text-white">TSC QUANTUM S.R.L.</strong>, în calitate de operator al platformei naționale{" "}
            <strong className="text-slate-900 dark:text-white">PRO LIGUE ROMÂNIA</strong> (disponibilă la adresa web{" "}
            <a href="https://ligue.ro" className="text-lime-600 dark:text-lime-400 hover:underline font-bold">
              ligue.ro
            </a>
            ). Acest document explică transparent ce date colectăm, de ce le colectăm și cum vă exercitați drepturile legale.
          </p>
        </div>
      </section>

      {/* Bento Highlights Bar */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-lime-400/20 text-lime-600 dark:text-lime-400 flex items-center justify-center shrink-0 border border-lime-400/30">
              <span className="material-symbols-outlined text-xl">apartment</span>
            </div>
            <div>
              <span className="text-xs font-black font-headline uppercase tracking-wider text-slate-900 dark:text-white block">
                Operator Legal
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug block mt-0.5">
                TSC QUANTUM S.R.L. (Timișoara, RO)
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-400/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-400/30">
              <span className="material-symbols-outlined text-xl">lock</span>
            </div>
            <div>
              <span className="text-xs font-black font-headline uppercase tracking-wider text-slate-900 dark:text-white block">
                Criptare &amp; Securitate
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug block mt-0.5">
                Parole bcrypt, conexiuni TLS/SSL securizate
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
              <span className="material-symbols-outlined text-xl">block</span>
            </div>
            <div>
              <span className="text-xs font-black font-headline uppercase tracking-wider text-slate-900 dark:text-white block">
                Fără Vânzare Date
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug block mt-0.5">
                Nu vindem și nu înstrăinăm datele terților
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-400/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-400/30">
              <span className="material-symbols-outlined text-xl">person_remove</span>
            </div>
            <div>
              <span className="text-xs font-black font-headline uppercase tracking-wider text-slate-900 dark:text-white block">
                Dreptul de a fi Uitat
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug block mt-0.5">
                Ștergere cont direct din panou sau prin email
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Content Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        <div className="card p-6 sm:p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-10 shadow-sm text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          
          {/* Articolul 1 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 1. Operatorul Datelor cu Caracter Personal
              </h2>
            </div>
            <p>
              Prezenta politică reglementează prelucrarea datelor cu caracter personal efectuate de către:
            </p>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-1 text-slate-800 dark:text-slate-200">
              <p><strong className="text-slate-950 dark:text-white">Denumire societate:</strong> TSC QUANTUM S.R.L.</p>
              <p><strong className="text-slate-950 dark:text-white">Cod Unic de Înregistrare (CUI):</strong> 53063735</p>
              <p><strong className="text-slate-950 dark:text-white">Număr Înregistrare Registrul Comerțului:</strong> J2025095153006</p>
              <p><strong className="text-slate-950 dark:text-white">Sediul Social:</strong> Timișoara, Județul Timiș, România</p>
              <p><strong className="text-slate-950 dark:text-white">Platformă Web Oficială:</strong> https://ligue.ro (PRO LIGUE ROMÂNIA)</p>
              <p><strong className="text-slate-950 dark:text-white">Adresă E-mail Oficială &amp; DPO:</strong> contact@ligue.ro</p>
            </div>
            <p>
              În sensul Regulamentului General privind Protecția Datelor (Regulamentul UE 2016/679 - „GDPR”), <strong>TSC QUANTUM S.R.L.</strong> are calitatea de <strong>Operator</strong> de date cu caracter personal în legătură cu serviciile oferite prin intermediul platformei PRO LIGUE.
            </p>
          </section>

          {/* Articolul 2 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 2. Principiile Fundamentale ale Prelucrării
              </h2>
            </div>
            <p>
              TSC QUANTUM S.R.L. se angajează să respecte cu strictețe principiile prevăzute la Art. 5 din Regulamentul (UE) 2016/679:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Legalitate, echitate și transparență:</strong> Datele sunt prelucrate în mod legal, corect și transparent față de persoana vizată.
              </li>
              <li>
                <strong>Limitarea scopului:</strong> Datele sunt colectate în scopuri determinate, explicite și legitime legate strict de organizarea și participarea la campionatele sportive.
              </li>
              <li>
                <strong>Reducerea la minimum a datelor:</strong> Colectăm strict datele adecvate, relevante și limitate la ceea ce este necesar în raport cu scopurile prelucrării.
              </li>
              <li>
                <strong>Exactitate:</strong> Luăm toate măsurile rezonabile pentru a ne asigura că datele inexacte sunt rectificate sau șterse prompt.
              </li>
              <li>
                <strong>Limitarea stocării:</strong> Datele sunt păstrate într-o formă care permite identificarea persoanelor vizate pe o perioadă care nu depășește perioada necesară îndeplinirii scopurilor.
              </li>
              <li>
                <strong>Integritate și confidențialitate:</strong> Prelucrarea se efectuează într-un mod care asigură securitatea adecvată a datelor, inclusiv protecția împotriva prelucrării neautorizate sau ilegale și împotriva pierderii ori distrugerii accidentale.
              </li>
            </ul>
          </section>

          {/* Articolul 3 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 3. Categoriile de Date Prelucrate pe Roluri
              </h2>
            </div>
            <p>
              Platforma PRO LIGUE gestionează un ecosistem sportiv complex. Categoriile de date colectate diferă în funcție de calitatea utilizatorului:
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h3 className="font-bold font-headline uppercase text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-lime-600 dark:text-lime-400 text-base">emoji_events</span>
                  1. Organizatori de Campionate &amp; Administratori de Ligi
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Nume, prenume, adresă de e-mail, număr de telefon, parolă (stocată criptat), date de identificare fiscală pentru decontare/facturare (CUI/CIF companie, adresă, cont IBAN, bancă), setări ale campionatelor organizate.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h3 className="font-bold font-headline uppercase text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-lime-600 dark:text-lime-400 text-base">gavel</span>
                  2. Arbitri Oficiali Omologați &amp; Observatori
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Nume, prenume, adresă de e-mail, număr de telefon, categorie/ecuson oficial (ex: RIFA Elite, Liga 1 Central, VAR Pro), ani de experiență, fotografie de profil / brigadă, meciuri delegate, rapoarte oficiale de arbitraj semnate digital, evaluări acordate de observatori.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h3 className="font-bold font-headline uppercase text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-lime-600 dark:text-lime-400 text-base">groups</span>
                  3. Lideri de Echipă (Manageri / Căpitani) &amp; Jucători
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Nume, prenume, adresă de e-mail, rol în echipă, sport practicat, poziție pe teren (ex: Portar, Mijlocaș, Atacant), număr pe tricou, picior preferat, înălțime, greutate, statistici sportive (goluri marcate, cartonașe galbene/roșii, prezențe, note fair-play), fotografie sportivă (card jucător / legitimație), card fizic de membru.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h3 className="font-bold font-headline uppercase text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-lime-600 dark:text-lime-400 text-base">stadium</span>
                  4. Proprietari &amp; Administratori de Arene Sportive
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Nume solicitant/administrator, e-mail de contact, telefon, denumire companie/club/asociație proprietară, CUI/CIF, certificat înregistrare, specificații tehnice arene, adrese geografice și dovezi de omologare.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h3 className="font-bold font-headline uppercase text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-lime-600 dark:text-lime-400 text-base">confirmation_number</span>
                  5. Spectatori &amp; Cumpărători de Bilete la Meciuri
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Nume și prenume cumpărător, adresă de e-mail (pentru livrarea biletului electronic), număr de telefon (opțional), sector, rând și loc alocat, cod de bare/QR unic, istoric tranzacții și status validare acces turnichet/steward. Datele complete de card bancar sunt procesate exclusiv prin Stripe și nu ajung niciodată pe serverele ligue.ro.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h3 className="font-bold font-headline uppercase text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-lime-600 dark:text-lime-400 text-base">terminal</span>
                  6. Date Tehnice &amp; Jurnale de Securitate (Toți Vizitatorii)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Adresa IP de conectare și de înregistrare cont (`signupIp`), identificatorul dispozitivului/browserului (User-Agent), timestamp-ul autentificărilor, acțiuni de audit de securitate (`AuditLog`) pentru prevenirea accesului neautorizat și a fraudelor informatice.
                </p>
              </div>
            </div>
          </section>

          {/* Articolul 4 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 4. Temeiurile Juridice ale Prelucrării
              </h2>
            </div>
            <p>
              Prelucrarea datelor dumneavoastră se întemeiază pe următoarele prevederi din Articolul 6 din Regulamentul (UE) 2016/679:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Executarea contractului (Art. 6 alin. 1 lit. b GDPR):</strong> Crearea contului de utilizator, înscrierea în competiții, desemnarea arbitrilor, emiterea biletelor electronice și furnizarea serviciilor de clasamente și tablouri de joc.
              </li>
              <li>
                <strong>Obligația legală (Art. 6 alin. 1 lit. c GDPR):</strong> Îndeplinirea obligațiilor financiar-contabile și fiscale (facturarea abonamentelor de echipă, biletelor și taxelor de participare) conform legislației române în vigoare.
              </li>
              <li>
                <strong>Interesul legitim (Art. 6 alin. 1 lit. f GDPR):</strong> Asigurarea securității cibernetice a platformei, prevenirea fraudelor la meciuri și bilete, soluționarea disputelor sportive și disciplinare, precum și garantarea corectitudinii clasamentelor.
              </li>
              <li>
                <strong>Consimțământul (Art. 6 alin. 1 lit. a GDPR):</strong> Pentru comunicări opționale de marketing sportiv, alerte pe e-mail sau notificări push nespecificate în regulamentul oficial al ligii.
              </li>
            </ul>
          </section>

          {/* Articolul 5 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 5. Scopurile Prelucrării Datelor
              </h2>
            </div>
            <p>
              TSC QUANTUM S.R.L. utilizează datele dumneavoastră exclusiv în următoarele scopuri legitime:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Autentificarea securizată și gestionarea profilului de utilizator pe platformă.</li>
              <li>Organizarea campionatelor, generarea programului etapelor și alcătuirea clasamentelor omologate.</li>
              <li>Conducerea meciurilor, validarea scorurilor în timp real și întocmirea rapoartelor de arbitraj.</li>
              <li>Emiterea biletelor electronice dotate cu semnături criptografice QR și scanarea acestora la porțile arenelor.</li>
              <li>Emiterea facturilor fiscale și procesarea plăților prin partenerii autorizați.</li>
              <li>Transmiterea alertelor de meci, a notificărilor de convocare și a comunicatelor oficiale de presă.</li>
              <li>Asigurarea conformității cu regulamentele federațiilor și asociațiilor sportive partenere.</li>
            </ol>
          </section>

          {/* Articolul 6 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 6. Securitatea Tranzacțiilor și Datele de Plată
              </h2>
            </div>
            <p>
              Pentru plățile online (bilete de acces, abonamente de echipe sau înscrieri în ligă), tranzacțiile sunt procesate exclusiv prin intermediul partenerilor autorizați și certificați la standardul de securitate <strong>PCI-DSS Nivel 1</strong> (cum ar fi <strong>Stripe Inc.</strong> și <strong>PayPal Inc.</strong>).
            </p>
            <p>
              <strong className="text-slate-900 dark:text-white">Garanție de securitate:</strong> Serverele TSC QUANTUM S.R.L. și baza de date ligue.ro <strong>NU accesează, NU procesează și NU stochează datele sensibile de card</strong> (număr complet card, cod CVV/CVC, data expirării). Stocăm doar referințe criptate de confirmare a plății, ultimele 4 cifre ale cardului pentru identificare în extrasul de cont și datele necesare facturii fiscale conform legii.
            </p>
          </section>

          {/* Articolul 7 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 7. Destinatarii Datelor și Transferul către Terți
              </h2>
            </div>
            <p>
              Datele dumneavoastră pot fi transmise strict în scopurile menționate către următoarele categorii de destinatari („Împuterniciți ai Operatorului”):
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Furnizori de servicii de găzduire web și baze de date cloud securizate localizate în Uniunea Europeană.</li>
              <li>Procesatori de plăți electronice securizate (Stripe, PayPal, Apple Pay, Google Pay).</li>
              <li>Furnizori de servicii de transmitere e-mail tranzacțional (notificări de cont, invitații de lot, bilete PDF).</li>
              <li>Organisme sportive oficiale sau comisii de disciplină exclusiv în cadrul investigării unor încălcări ale regulamentului sportiv.</li>
              <li>Autorități publice, instanțe sau organe judiciare, exclusiv în măsura în care există o obligație legală expresă.</li>
            </ul>
            <p>
              <strong className="text-slate-900 dark:text-white">Angajament ferm:</strong> TSC QUANTUM S.R.L. <strong>nu vinde, nu închiriază și nu tranzacționează datele dumneavoastră cu caracter personal</strong> către companii de publicitate sau brokeri de date.
            </p>
          </section>

          {/* Articolul 8 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 8. Perioada de Păstrare și Arhivare a Datelor
              </h2>
            </div>
            <p>
              Datele cu caracter personal sunt păstrate pe durata activității contului dumneavoastră pe platformă:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Datele de cont și profil sportiv:</strong> Până la solicitarea de ștergere a contului de către utilizator.
              </li>
              <li>
                <strong>Documente financiar-contabile (facturi, plăți):</strong> Se păstrează conform termenelor legale obligatorii prevăzute de legislația fiscală și contabilă din România (10 ani de la încheierea exercițiului financiar în care au fost întocmite).
              </li>
              <li>
                <strong>Jurnale de audit și securitate:</strong> Sunt stocate pe o perioadă de până la 12 luni, după care sunt arhivate sau anonimizate automat.
              </li>
              <li>
                <strong>Arhiva statistică a meciurilor:</strong> Scorurile, statisticile de meci și istoricul campionatelor rămân ca palmares sportiv public fără date de identificare directă (cum ar fi e-mailuri sau telefoane).
              </li>
            </ul>
          </section>

          {/* Articolul 9 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 9. Drepturile Dumneavoastră conform GDPR
              </h2>
            </div>
            <p>
              În calitate de persoană vizată, beneficiați în mod garantat de următoarele drepturi conferite de Regulamentul (UE) 2016/679:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block font-headline">1. Dreptul de Acces (Art. 15)</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">Puteți solicita confirmarea dacă datele dumneavoastră sunt prelucrate și o copie a acestora.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block font-headline">2. Dreptul la Rectificare (Art. 16)</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">Puteți corecta oricând datele inexacte direct din cont sau contactându-ne.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block font-headline">3. Dreptul la Ștergere / „De a fi Uitat” (Art. 17)</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">Puteți solicita ștergerea definitivă a contului și a datelor asociate.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block font-headline">4. Dreptul la Restricționare (Art. 18)</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">Puteți cere blocarea temporară a prelucrării în cazurile prevăzute de lege.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block font-headline">5. Dreptul la Portabilitate (Art. 20)</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">Puteți primi datele furnizate într-un format structurat, utilizat în mod curent (JSON/CSV).</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block font-headline">6. Dreptul la Opoziție (Art. 21)</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">Vă puteți opune în orice moment prelucrărilor bazate pe interes legitim.</span>
              </div>
            </div>
          </section>

          {/* Articolul 10 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 10. Procedura de Exercitare a Drepturilor și Butonul de Ștergere
              </h2>
            </div>
            <p>
              Pentru a vă exercita drepturile privind protecția datelor, aveți la dispoziție următoarele mecanisme directe:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Direct din contul de utilizator:</strong> Utilizatorii autentificați pot accesa secțiunea{" "}
                <Link href="/profile" className="text-lime-600 dark:text-lime-400 font-bold hover:underline">
                  Profilul Meu &rarr; Dreptul de a fi Uitat (Ștergere Cont GDPR)
                </Link>{" "}
                pentru a declanșa procedura de ștergere completă a contului.
              </li>
              <li>
                <strong>Prin e-mail oficial către DPO:</strong> Puteți trimite oricând o cerere scrisă la adresa de e-mail{" "}
                <a href="mailto:contact@ligue.ro" className="text-lime-600 dark:text-lime-400 font-bold hover:underline">
                  contact@ligue.ro
                </a>
                . Vă vom răspunde în termen de maximum 30 de zile calendaristice de la primirea cererii, termen ce poate fi prelungit conform art. 12 alin. (3) GDPR în cazuri de complexitate deosebită.
              </li>
            </ol>
          </section>

          {/* Articolul 11 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 11. Protecția Datelor Minorilor în Sport
              </h2>
            </div>
            <p>
              În cadrul turneelor dedicate tineretului și juniorilor, înscrierea jucătorilor minori și afișarea datelor sportive (nume, număr tricou, meciuri) se realizează exclusiv cu acordul prealabil al părinților, tutorilor sau al cluburilor sportive afiliate autorizate.
            </p>
            <p>
              Dacă aveți cunoștință despre înregistrarea unui minor sub vârsta de 16 ani fără consimțământul părintelui sau reprezentantului legal, vă rugăm să ne semnalați de urgență la{" "}
              <a href="mailto:contact@ligue.ro" className="text-lime-600 dark:text-lime-400 font-bold hover:underline">
                contact@ligue.ro
              </a>{" "}
              pentru eliminarea imediată a înregistrării.
            </p>
          </section>

          {/* Articolul 12 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 12. Politica privind Modulele Cookie
              </h2>
            </div>
            <p>
              Platforma PRO LIGUE utilizează exclusiv module cookie și tehnologii de stocare strict necesare funcționării:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Cookie-uri esențiale de sesiune (NextAuth):</strong> Mențin starea de conectare securizată a utilizatorului și previn atacurile de tip CSRF (Cross-Site Request Forgery).
              </li>
              <li>
                <strong>Stocare locală (localStorage):</strong> Reține preferința de interfață grafică a utilizatorului (temă Întunecată / Luminoasă) și starea sportului selectat.
              </li>
              <li>
                <strong>Nu utilizăm cookie-uri terțe invazive</strong> de urmărire comportamentală în rețele publicitare externe.
              </li>
            </ul>
          </section>

          {/* Articolul 13 */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 13. Măsuri Tehnice și Organizatorice de Securitate
              </h2>
            </div>
            <p>
              Pentru protejarea integrității și confidențialității datelor, TSC QUANTUM S.R.L. aplică măsuri avansate conform Art. 32 GDPR:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Criptarea întregului trafic web prin certificate digitale moderne SSL/TLS (HTTPS).</li>
              <li>Hash-uirea criptografică ireversibilă a parolelor cu algoritmul bcrypt (cu salt securizat).</li>
              <li>Izolarea accesului la nivel de bază de date și jurnale detaliate de securitate (`AuditLog`).</li>
              <li>Proceduri regulate de backup și restaurare pentru prevenirea pierderii accidentale a datelor.</li>
            </ul>
          </section>

          {/* Articolul 14 */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                Articolul 14. Contact DPO și Dreptul de Reclamație la Autoritate
              </h2>
            </div>
            <p>
              Dacă aveți întrebări, nelămuriri sau doriți să vă exercitați oricare dintre drepturile GDPR, ne puteți contacta direct:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-lime-600 dark:text-lime-400 font-bold font-headline text-xs uppercase">
                  <span className="material-symbols-outlined text-base">support_agent</span>
                  Responsabil cu Protecția Datelor (DPO)
                </div>
                <p className="font-bold text-slate-900 dark:text-white">TSC QUANTUM S.R.L.</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Timișoara, Județul Timiș, România</p>
                <p className="text-xs">
                  E-mail:{" "}
                  <a href="mailto:contact@ligue.ro" className="text-lime-600 dark:text-lime-400 font-bold hover:underline">
                    contact@ligue.ro
                  </a>
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold font-headline text-xs uppercase">
                  <span className="material-symbols-outlined text-base">account_balance</span>
                  Autoritatea Națională de Supraveghere (ANSPDCP)
                </div>
                <p className="font-bold text-slate-900 dark:text-white">A.N.S.P.D.C.P. România</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București</p>
                <p className="text-xs">
                  Website:{" "}
                  <a href="https://www.dataprotection.ro" target="_blank" rel="noreferrer" className="text-lime-600 dark:text-lime-400 font-bold hover:underline">
                    www.dataprotection.ro
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Bottom Nav Actions */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
            <Link
              href="/termeni"
              className="text-xs font-headline font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-base">gavel</span> Termeni și Condiții de Utilizare
            </Link>

            <Link
              href="/profile"
              className="px-4 py-2 rounded-xl bg-lime-400 text-slate-950 hover:bg-lime-300 text-xs font-headline font-black uppercase tracking-wider shadow-sm transition flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">person</span> Gestionează Datele din Cont
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
