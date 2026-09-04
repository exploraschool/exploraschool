# Dónde guardar cada secreto

Nunca subas claves al repositorio. GitHub solo aloja código; los secretos viven en **Vercel** (web) y **Firebase** (emails).

## Resumen rápido

| Secreto | Dónde | Para qué |
|---------|-------|----------|
| `NEXT_PUBLIC_FIREBASE_*` | Vercel | Cliente web (público) |
| `FIREBASE_PROJECT_ID` | Vercel | API `/api/leads`, admin |
| `FIREBASE_CLIENT_EMAIL` | Vercel | Firebase Admin SDK |
| `FIREBASE_PRIVATE_KEY` | Vercel | Firebase Admin SDK |
| `ADMIN_GOOGLE_EMAIL` | Código (`admin-auth-config.ts`) | Solo `explora.sclub@gmail.com` puede entrar al panel vía Google |
| `LEAD_CONFIRM_SECRET` | Vercel **y** Firebase | Enlace de confirmación en emails al equipo |
| `NEXT_PUBLIC_SITE_URL` | Vercel | URLs canónicas |
| `RESEND_API_KEY` | Vercel **y** Firebase Functions | Envío de emails (mismo valor en ambos) |
| `LEAD_NOTIFICATION_EMAIL` | Vercel **y** Firebase Functions | Destino alertas equipo (`explora.sclub@gmail.com`) |
| `RESEND_FROM` | Vercel **y** Firebase Functions | Remitente verificado en Resend |
| `SITE_URL` | Firebase Functions | Enlaces en emails |

---

## 1. Vercel (Next.js)

[vercel.com](https://vercel.com) → proyecto **exploraschool** → **Settings → Environment Variables**

Añade en **Production** (y Preview si quieres probar):

```
NEXT_PUBLIC_SITE_URL=https://www.explora-school.es
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=exploraschool-9ea82
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

FIREBASE_PROJECT_ID=exploraschool-9ea82
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

ADMIN_PASSWORD=obsoleto-usar-google-sign-in
LEAD_CONFIRM_SECRET=genera-un-string-aleatorio-largo

RESEND_API_KEY=re_...clave-valida-de-resend.com
LEAD_NOTIFICATION_EMAIL=explora.sclub@gmail.com
RESEND_FROM=Explora School <onboarding@resend.dev>
```

**`LEAD_CONFIRM_SECRET`:** genera uno con:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Cada push a `main` en GitHub redeploya Vercel automáticamente si el repo está conectado.

### Admin con Google

1. [Firebase Console](https://console.firebase.google.com/project/exploraschool-9ea82/authentication/providers) → Authentication → Sign-in method → **Google** → Enable
2. En esa misma pantalla, **Nombre público del proyecto** = `Explora School & Club` (así aparece en la ventana de Google)
3. Authorized domains: `localhost`, `explora-school.es`, `www.explora-school.es`
4. Entra en `/admin/login` y usa **Entrar con Google** con `explora.sclub@gmail.com`

---

## 2. Firebase Functions (emails Resend)

Los emails **no** van en Vercel. Van en Firebase:

```powershell
cd c:\Users\User\Desktop\exploraschool
firebase login
firebase use exploraschool-9ea82

# Secretos (no se ven en consola después de guardarlos)
firebase functions:secrets:set RESEND_API_KEY
firebase functions:secrets:set LEAD_CONFIRM_SECRET

# Variables de texto
firebase functions:config:unset gmail 2>$null
```

También en **Firebase Console → Functions → Environment variables**:

| Variable | Valor |
|----------|-------|
| `LEAD_NOTIFICATION_EMAIL` | `explora.sclub@gmail.com` |
| `RESEND_FROM` | `Explora School <onboarding@resend.dev>` |
| `SITE_URL` | `https://www.explora-school.es` |

`LEAD_CONFIRM_SECRET` debe ser **el mismo valor** que en Vercel.

**Importante:** si el email al cliente no llega, revisa los logs de Firebase (`onLeadUpdated`) y confirma que `RESEND_API_KEY` en Vercel y Firebase es una clave **válida** de [resend.com/api-keys](https://resend.com/api-keys). Un error típico es `API key is invalid`.

Despliega:

```powershell
firebase deploy --only functions
```

---

## 3. GitHub

- El repo **no** contiene `.env` ni `functions/.env` (están en `.gitignore`)
- Conecta el repo en Vercel: cada PR genera preview, cada merge a `main` → producción
- **No** guardes API keys en GitHub Secrets salvo que añadas CI propio (no es necesario hoy)

---

## 4. Flujo de reservas automatizado

1. Cliente envía reserva en `/reserva` → Firestore `leads` con `status: pending`
2. Firebase Function → email a **explora.sclub@gmail.com** con botón **Confirmar reserva**
3. Equipo hace clic en el enlace o usa `/admin/leads` → **Confirmar**
4. Firebase Function detecta `status: confirmed` → email automático al **cliente**

---

## 5. Rotar una clave comprometida

1. **Resend:** [resend.com](https://resend.com) → API Keys → revocar y crear nueva → `firebase functions:secrets:set RESEND_API_KEY`
2. **Admin:** el panel usa Google Sign-In; solo `explora.sclub@gmail.com`. Activa el proveedor Google en Firebase Authentication.
3. **Confirm links:** regenerar `LEAD_CONFIRM_SECRET` en Vercel y Firebase

---

## 6. Desarrollo local

```powershell
cp .env.example .env
cp functions/.env.example functions/.env
```

Rellena valores locales. **Nunca** hagas commit de esos archivos.
