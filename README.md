# Explora School & Club

Next.js 15 site for [sierranevadaclases.es](https://www.sierranevadaclases.es) — ski, snowboard and telemark lessons in Sierra Nevada. Frontend on **Vercel**, data on **Firebase** (Firestore, Storage, Auth, Cloud Functions) in **europe-west1**.

---

## Prerequisites

- Node.js 20+
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- GitHub account (repo hosting)
- Vercel account (Next.js hosting)
- Google Cloud / Firebase project with billing enabled (Blaze plan required for Cloud Functions)

---

## 1. GitHub

```bash
git init
git add .
git commit -m "Initial commit — Explora School"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/exploraschool.git
git push -u origin main
```

Never commit `.env`, `serviceAccount.json`, or `*-firebase-adminsdk-*.json` (already in `.gitignore`).

---

## 2. Firebase / Google Cloud

1. Create a GCP project (e.g. `explora-school`) at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Firestore**, **Storage**, **Authentication** (Email/Password for admin), and **Functions**.
3. Set Firestore location to **europe-west1** (Belgium) when prompted — do not use US regions.
4. Register a **Web app** and copy the Firebase config values into `.env`.
5. Create a **service account** (Project settings → Service accounts → Generate new private key). Use the JSON locally as `serviceAccount.json` **or** copy `project_id`, `client_email`, and `private_key` into env vars (preferred for Vercel).

Update `.firebaserc` with your project ID:

```json
{ "projects": { "default": "your-project-id" } }
```

Sign in and select the project:

```bash
firebase login
firebase use your-project-id
```

### Deploy rules & functions

```bash
# Install function dependencies
cd functions && npm install && npm run build && cd ..

# Deploy Firestore rules, Storage rules, indexes, and Cloud Functions
firebase deploy --only firestore:rules,firestore:indexes,storage,functions
```

Cloud Functions run in **europe-west1** (see `functions/src/index.ts`).

### Admin access

1. Firebase Console → Authentication → Sign-in method → enable **Email/Password**.
2. Add an admin user (e.g. `explora.sclub@gmail.com`).
3. Optionally set custom claim `admin: true` via Admin SDK for additional admin emails.

Firestore and Storage rules grant full write access to authenticated users with `admin: true` or email `explora.sclub@gmail.com`.

### Resend (lead emails)

1. Create an account at [resend.com](https://resend.com) and verify your sending domain.
2. Set `RESEND_API_KEY` in Firebase Functions config:

```bash
firebase functions:secrets:set RESEND_API_KEY
# or for local emulator:
firebase functions:config:set resend.api_key="re_xxxx"
```

3. Set `RESEND_FROM` to a verified sender (e.g. `Explora School <reservas@sierranevadaclases.es>`).

When a document is created in the `leads` collection, `onLeadCreated` sends an email to `explora.sclub@gmail.com` (override with `LEAD_NOTIFICATION_EMAIL`). If `RESEND_API_KEY` is missing, the function logs and skips email — the lead is still saved.

---

## 3. Environment variables

Copy the template and fill in values:

```bash
cp .env.example .env
```

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_FIREBASE_*` | Vercel (all envs) | Client-side Firebase SDK |
| `FIREBASE_PROJECT_ID` | Vercel (server), local scripts | Admin SDK project |
| `FIREBASE_CLIENT_EMAIL` | Vercel (server), local scripts | Service account email |
| `FIREBASE_PRIVATE_KEY` | Vercel (server), local scripts | Service account key (use `\n` for newlines in Vercel) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Local only | Path to `serviceAccount.json` (alternative to key env vars) |
| `RESEND_API_KEY` | Firebase Functions secret | Lead notification emails |
| `LEAD_NOTIFICATION_EMAIL` | Firebase Functions (optional) | Override recipient |
| `RESEND_FROM` | Firebase Functions (optional) | Verified sender address |

In **Vercel** → Project → Settings → Environment Variables: add all `NEXT_PUBLIC_*` and server-side `FIREBASE_*` vars for Production, Preview, and Development.

---

## 4. Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Next.js**.
3. Add environment variables from the table above.
4. Deploy. Custom domain: `www.sierranevadaclases.es` (DNS CNAME to Vercel).

Vercel serves the Next.js app. Firebase handles Firestore, Storage, Auth, and Functions — not Firebase Hosting in v1.

---

## 5. Seed Firestore

After credentials are configured in `.env`:

```bash
npm run seed
```

This reads `src/data/instructors.ts`, `prices.ts`, `faqs.ts`, and `reviews.ts` and writes:

| Collection | Document ID | Content |
|------------|-------------|---------|
| `instructors` | `{slug}` | Instructor profiles |
| `faqs` | `{id}` | FAQ entries |
| `reviews` | `{id}` | TripAdvisor reviews |
| `prices` | `main` | Current + legacy price tables |

Safe to re-run — uses merge writes.

---

## 6. Upload legacy images

Place images in `public/images/legacy/` (from scrape, backup, or manual upload), then:

```bash
npm run upload-legacy
```

Files are uploaded to Firebase Storage under `public/legacy/` with public read access per `storage.rules`.

If Firebase credentials are not configured, images still work from Next.js `public/` locally and on Vercel.

---

## 7. Local development

```bash
npm install
cp .env.example .env   # fill values
npm run dev            # http://localhost:3000
```

Optional Firebase emulators:

```bash
firebase emulators:start
```

---

## 8. Firestore security model

| Collection | Public read | Public write | Admin |
|------------|-------------|--------------|-------|
| `instructors` | ✅ | ❌ | read/write |
| `prices` | ✅ | ❌ | read/write |
| `faqs` | ✅ | ❌ | read/write |
| `reviews` | ✅ | ❌ | read/write |
| `leads` | ❌ | create only (validated) | read/write |

Contact/reservation forms write to `leads` with fields `name`, `email`, `message`, and `createdAt` (use `serverTimestamp()`). WhatsApp CTA remains available if Firebase is unavailable.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run scrape` | Crawl legacy site (Wayback fallback) |
| `npm run seed` | Seed Firestore from `src/data/` |
| `npm run upload-legacy` | Upload `public/images/legacy/` to Storage |
| `firebase deploy` | Deploy rules, indexes, functions |

---

## Project structure (Firebase)

```
firebase.json           # Firestore, Storage, Functions config
.firebaserc             # Firebase project alias
firestore.rules         # Security rules
firestore.indexes.json  # Composite indexes
storage.rules           # Storage security rules
functions/              # Cloud Functions (europe-west1)
scripts/
  seed-firebase.mjs
  upload-legacy-to-firebase.mjs
.env.example            # Environment variable template
```

---

## Support

- Email: explora.sclub@gmail.com
- WhatsApp: +34 660 262 790
