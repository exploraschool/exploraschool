# Migrar a cuenta explora.sclub@gmail.com

El primer deploy se hizo con la sesión local de **amsnowboardcoach** (incorrecta).
Todo debe vivir en la cuenta de **explora.sclub@gmail.com**.

## Estado actual (configurado)

| Servicio | Proyecto | URL |
|----------|----------|-----|
| **Vercel** | `exploraschool` | https://explora-school.es |
| **Firebase** | `exploraschool-9ea82` | [Console](https://console.firebase.google.com/project/exploraschool-9ea82) |
| **Dominio** | `explora-school.es` + `www` | En Vercel (eliminado `sierranevadaclases.es`) |
| **Emails** | Resend vía Vercel | Notificaciones a `explora.sclub@gmail.com` |

Variables de entorno, Firebase Admin y deploy de producción: **listos**.

---

## Pasos en tu máquina (sesión Explora)

### 1. GitHub — iniciar sesión con explora.sclub@gmail.com

```powershell
gh auth logout
gh auth login
# → GitHub.com → HTTPS → Login with browser → cuenta explora.sclub@gmail.com
```

Crear repo y subir:

```powershell
cd c:\Users\User\Desktop\exploraschool
git remote remove origin
gh repo create exploraschool --public --source=. --remote=origin --push --description "Explora School and Club - Sierra Nevada"
```

(Si el nombre está ocupado, usa `explora-school` o el slug de vuestra org.)

### 2. Vercel — iniciar sesión con explora.sclub@gmail.com

```powershell
vercel login
# → elegir explora.sclub@gmail.com en el navegador
```

Deploy producción (dominio público `.vercel.app`):

```powershell
cd c:\Users\User\Desktop\exploraschool
vercel --prod
```

Vercel asignará algo como `https://exploraschool.vercel.app` o `https://exploraschool-xxx.vercel.app`.

### 3. Conectar GitHub ↔ Vercel (recomendado)

En [vercel.com](https://vercel.com) → **Add New Project** → importar el repo de Explora → Framework **Next.js** → Deploy.

Cada push a `main` generará preview + producción automática.

### 4. Variables de entorno en Vercel (cuenta Explora)

Copiar desde `.env.example`:

- `RESEND_API_KEY`, `LEAD_CONFIRM_SECRET` (Vercel)
- `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (Vercel)
- Admin: Google Sign-In (solo `explora.sclub@gmail.com`) — activa el proveedor Google en Firebase Authentication

### 5. Dominio explora-school.es (producción)

Dominio oficial: **https://www.explora-school.es**

#### Paso A — Añadir dominios en Vercel

1. [vercel.com](https://vercel.com) → tu proyecto **exploraschool** → **Settings → Domains**
2. Añade estos dos dominios:
   - `explora-school.es` (raíz / apex)
   - `www.explora-school.es`
3. Vercel mostrará los registros DNS que debes crear. Anótalos (pueden variar ligeramente según el registrador).

#### Paso B — Configurar DNS en tu registrador

Entra en el panel DNS de donde compraste `explora-school.es` (DonDominio, GoDaddy, Cloudflare, etc.) y crea:

| Tipo | Host | Valor |
|------|------|-------|
| **A** | `@` | `216.198.79.1` |
| **A** | `@` | `64.29.17.1` |
| **CNAME** | `www` | `75fa1090096c1630.vercel-dns-017.com` |

Alternativa (también válida): `A @ → 76.76.21.21` y `CNAME www → cname.vercel-dns.com`.

**Importante:** si los nameservers son `cosmos.dns-parking.com` / `nova.dns-parking.com`, cámbialos en Hostinger a los DNS reales del dominio (no parking), o usa los de Vercel: `ns1.vercel-dns.com` y `ns2.vercel-dns.com`.

#### Paso C — Redirección recomendada en Vercel

En **Settings → Domains**, marca `www.explora-school.es` como dominio **principal** y configura que `explora-school.es` redirija a `www` (o al revés — lo importante es que solo haya una URL canónica).

Recomendación del proyecto: **`https://www.explora-school.es`** como canónica.

#### Paso D — Variable de entorno en Vercel

**Settings → Environment Variables** → Production:

```
NEXT_PUBLIC_SITE_URL=https://www.explora-school.es
```

Redeploy después de guardar (Deployments → ⋯ → Redeploy).

#### Paso E — Verificar

1. Espera 5–60 minutos (propagación DNS).
2. En Vercel, los dominios deben mostrar ✓ **Valid**.
3. Abre `https://www.explora-school.es` — debe cargar el sitio con certificado SSL.
4. Comprueba `https://explora-school.es` — debe redirigir a `www` si lo configuraste así.

#### Paso F — Email con Resend + confirmación de reservas

Guía completa de secretos: [`docs/SECRETOS.md`](SECRETOS.md)

1. [resend.com](https://resend.com) → API Key
2. Firebase:
   ```powershell
   firebase functions:secrets:set RESEND_API_KEY
   firebase functions:secrets:set LEAD_CONFIRM_SECRET
   ```
3. Vercel → `LEAD_CONFIRM_SECRET` (mismo valor que Firebase)
4. `firebase deploy --only functions`

Flujo:
- Nueva reserva → email a `explora.sclub@gmail.com` con botón **Confirmar**
- Al confirmar (enlace o `/admin/leads`) → email automático al cliente

#### Dominio antiguo (sierranevadaclases.es)

Añadido al proyecto Vercel para **redirigir 308** a `https://www.explora-school.es` (misma ruta).

En el registrador DNS de `sierranevadaclases.es` configura:

| Tipo | Nombre | Valor |
|------|--------|--------|
| A | `@` | `216.198.79.1` |
| A | `@` | `64.29.17.1` |
| CNAME | `www` | `75fa1090096c1630.vercel-dns-017.com` |

(Alternativa simple: un solo A `@` → `76.76.21.21` y CNAME `www` → `cname.vercel-dns.com`.)

Hoy el dominio existe pero **no tiene registros DNS** (solo nameservers de nic.es). Hasta que los configures, la redirección no puede activarse.
---

## Firebase / GCP

Debe estar en el mismo Google Cloud vinculado a **explora.sclub@gmail.com**:

```powershell
firebase login
firebase use <project-id-explora>
firebase deploy --only firestore:rules,firestore:indexes,storage,functions
npm run seed
```
