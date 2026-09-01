# Migrar a cuenta explora.sclub@gmail.com

El primer deploy se hizo con la sesión local de **amsnowboardcoach** (incorrecta).
Todo debe vivir en la cuenta de **explora.sclub@gmail.com**.

## Estado actual (cuenta incorrecta)

| Servicio | Dónde quedó | URL |
|----------|-------------|-----|
| GitHub | `amsnowboardcoach/exploraschool` | https://github.com/amsnowboardcoach/exploraschool |
| Vercel | `am-snowboard-coach-s-projects` | https://exploraschool.vercel.app |

Puedes eliminar ese proyecto en Vercel y borrar/transferir el repo en GitHub cuando el de Explora esté listo.

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

- `NEXT_PUBLIC_FIREBASE_*` (proyecto GCP de Explora)
- `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `ADMIN_PASSWORD`
- `RESEND_API_KEY` (Functions)

### 5. Dominio sierranevadaclases.es

Vercel → Project → **Settings → Domains** → añadir `www.sierranevadaclases.es` y `sierranevadaclases.es` → actualizar DNS en el registrador.

---

## Firebase / GCP

Debe estar en el mismo Google Cloud vinculado a **explora.sclub@gmail.com**:

```powershell
firebase login
firebase use <project-id-explora>
firebase deploy --only firestore:rules,firestore:indexes,storage,functions
npm run seed
```
