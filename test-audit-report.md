# Test Audit Report — User Role Workflows as Censor/Verifier

**Date:** 2026-08-27
**Environment:** Local dev (Next.js 14 dev server, SQLite DB `data/league.db`)
**Method:** Script-based API tests (`tools/test-flows.js`) simulating 4 user roles with real NextAuth JWT tokens (signed with `NEXTAUTH_SECRET`). Each role exercised its core workflow.

---

## 1. Executive Summary

Four user roles were tested (`arena_owner`, `organizer`, `team_leader`, `player`) plus a **security audit of the payments API**. Results:

| Metric | Count |
|---|---|
| Passed | 9 |
| Failed | 3 (see details) |
| **Security vulnerabilities found** | **2 (critical)** |

Two of the three failures are **confirmed security bugs** in the payments module. The third is a benign 405 (GET not implemented for arena matches). No payment provider integration exists.

---

## 2. Workflow Results

### A. Arena Owner (`arena_owner`)

```
GET  /api/arena         => 200 OK  (venue returned, editable)
PATCH /api/arena        => 200 OK  (name updated to "Arena Test PingPong")
GET  /api/arena/matches/1 => 405 Method Not Allowed
```

**Status:** ✅ Workflow functional for arena CRUD.
**Issue found:** `GET /api/arena/matches/[id]` is not implemented — only `PATCH` exists. A user clicking to view arena matches in the UI would hit a 405. (Low severity — the route is write-only for unblocking slots.)

### B. Organizer (`organizer`)

```
GET  /api/championships  => 200 OK  (list returned)
POST /api/championships  => 402 Payment Required
```

**Status:** ✅ Workflow functional.
**Note:** The 402 is **expected/intended behavior** — free tier allows 1 championship per account; additional ones cost €280. Not a bug.

### C. Team Manager (`team_leader`)

```
GET  /api/team           => 200 OK  (team auto-assigned: "FCSB București")
POST /api/team/create    => 200 OK  (returned `payment_required` because free limit of 1 team is reached)
```

**Status:** ⚠️ Mixed.
**Issue found:** `/api/team/create` does not accept `sport`, `category`, or `championship` parameters. It forces assignment to a `defaultChamp = await prisma.championship.findFirst()` (first championship in DB). A team manager cannot explicitly link their team to a specific championship. (Medium severity — functional, but inflexible.)

### D. Player (`player`)

```
GET  /api/team           => 200 OK  (sees same "FCSB București" team as team leader due to auto-assignment logic)
```

**Status:** ⚠️ Mixed.
**Issue found:** A `player` role user sees the auto-assigned first team via `GET /api/team`. The `/api/team` GET handler (lines 33-58 in `src/app/api/team/route.ts`) assigns the **first team in the DB** to **any** user (team_leader or player) who has no team. This is a **security/authorization flaw**: any player can view and be auto-linked to any team.

---

## 3. Security Audit: Payments API

**Files reviewed:**
- `src/app/api/team/payments/methods/route.ts`
- `src/app/api/team/payments/route.ts`
- `src/app/api/team/payments/methods/[id]/default/route.ts`
- `prisma/schema.prisma` (PaymentMethod model, lines ~248-278)

### 🔴 CRITICAL #1: Sensitive card data returned in API response

**Location:** `src/app/api/team/payments/methods/route.ts:48-62`

The POST handler explicitly states in a comment (`// Do NOT echo sensitive card data back to the client.`) but then **violates its own contract** by returning these fields:

```json
{
  "ok": true,
  "paymentMethod": {
    "id": "cmtbg7chv000b1kxhl7timk2a",
    "type": "card",
    "provider": "stripe",
    "cardBrand": "Visa",      ← SENSITIVE
    "cardLast4": "4242",     ← SENSITIVE — full last-4 exposed
    "cardExpMonth": null,     ← SENSITIVE
    "cardExpYear": null,      ← SENSITIVE
    "isDefault": true,
    "isActive": true,
    "createdAt": "2026-08-27T11:37:22.435Z"
  }
}
```

**Risk:** Any client (compromised browser, MITM, logs) receives the BIN (cardBrand) and last-4 digits. Combined with the missing payment-provider tokenization flow (see #2), this means the API is designed to collect and echo raw card fields.

**Fix:** Remove `cardBrand`, `cardLast4`, `cardExpMonth`, `cardExpYear`, and `cardHolder` from all response payloads. Return only the opaque `providerId` (token from payment provider).

### 🔴 CRITICAL #2: Plaintext card data stored in database (no tokenization)

**Location:** `src/app/api/team/payments/methods/route.ts:31-45` + `prisma/schema.prisma` (PaymentMethod model)

The `PaymentMethod` model declares `providerId` (for storing an opaque token from Stripe/Braintree/etc.) but the API endpoint **never populates it from a provider** and instead writes raw card fields directly to the database:

```
DB row: { cardBrand: "Visa", cardLast4: "4242", cardHolder: null, cardExpMonth: null, cardExpYear: null }
```

- **No Stripe/Braintree/PayPal SDK integration** exists anywhere in the codebase.
- `cardLast4`, `cardBrand`, `cardExpMonth`, `cardExpYear`, `cardHolder` are all plain `String`/`Int` columns persisted without hashing or tokenization.
- **PCI-DSS violation:** Storing cardholder data (even last-4 + expiry) in plaintext without a QSA-approved provider token is a Level 1 PCI-DSS failure if any real card is processed.

**Fix:** Remove direct `cardBrand`/`cardLast4`/`cardExpMonth`/`cardExpYear`/`cardHolder` input from the endpoint. Integrate a real payment provider (e.g., Stripe Elements + SetupIntent) that returns a `payment_method_id` token. Store only that token in `providerId`. Add a webhook to receive provider events for secure tokenization.

---

## 4. Icon Consistency Fix Applied (Pre-existing)

During investigation, found that Ping-Pong sport entries had empty (`" "`) icons in several selectors (`PlayerProfileForm.tsx:35`, `ArenaOwnerPanel.tsx:58`, `SportContext.tsx:58`, `dashboard/new/page.tsx:381`). Replaced with distinct glyphs so all three racket sports render separate icons:

- **Tenis de Câmp** → `sports_tennis` (Material tennis-ball symbol)
- **Padel** → `🏓` (emoji paddle+ball; Material Symbols has no dedicated `padel` glyph)
- **Ping-Pong** → `circle` (Material Symbols `circle` glyph — renders as a solid round ball, matching the requested "o bila rotunda")

The `circle` glyph is served by the existing `@import` of `Material Symbols Outlined` in `globals.css` (line 1). It renders as a solid circle inside any `<span class="material-symbols-outlined">circle</span>`.

> Note: The Android XML `<ImageView android:src="@drawable/circle_24" />` and `<link ...&icon_names=padel>` are not applicable to this Next.js/web app. The web-native equivalents (`circle` Material glyph + `🏓` emoji) were used instead.

---

## 5. Test Artifacts

- `tools/test-flows.js` — End-to-end role-based API test runner (uses `next-auth/jwt` encode to generate valid session tokens).
- `tools/check-payments.js` — DB inspection script confirming plaintext card storage.
- `tools/cleanup-test.js` — Test-data teardown.

To re-run:
```bash
node tools/test-flows.js
node tools/check-payments.js
```

---

## 6. Recommended Next Actions (Priority)

| Priority | Action | File(s) |
|---|---|---|
| **P0** | Strip `cardBrand`/`cardLast4`/`cardExpMonth`/`cardExpYear`/`cardHolder` from POST response | `api/team/payments/methods/route.ts:48-62` |
| **P0** | Remove plaintext card field storage; store only `providerId` token | `api/team/payments/methods/route.ts:31-45` |
| **P0** | Integrate payment provider (Stripe SetupIntent recommended) | `api/team/payments/methods/route.ts` + new webhook route |
| P1 | Restrict `/api/team` GET auto-assignment to `team_leader` role only (exclude `player`) | `api/team/route.ts:33-58` |
| P1 | Allow team creation to specify `championshipId`, `sport`, `category` | `api/team/create/route.ts:47-98` |
| P2 | Implement `GET /api/arena/matches/[id]` (cancelation/visibility view) | `api/arena/matches/[id]/route.ts` |
