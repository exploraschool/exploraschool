# INVENTORY — Explora School & Club Legacy Migration

**Fecha:** 2026-09-01  
**Fuente primaria:** Wayback Machine (sitio live caído — `fetch failed` / 503)  
**Dominio:** https://www.sierranevadaclases.es/

---

## Resumen ejecutivo

| Métrica | Resultado |
|---------|-----------|
| Páginas HTML guardadas | 4 / 37 intentadas |
| Imágenes descargadas | 0 / 35 URLs identificadas |
| Blog posts migrados (HTML) | 0 / 26 |
| Contenido textual (JSON) | 4 páginas en `legacy/content.json` |
| Fallback KB | Sección 1 del brief maestro aplicada |

---

## Páginas scrapeadas (HTML en `legacy/html/`)

| Ruta | Archivo | Fuente | Estado |
|------|---------|--------|--------|
| `/` | `home.html` | wayback-20221002201700 | ✅ OK |
| `/contacto/` | `contacto.html` | wayback-20221002201048 | ✅ OK |
| `/servicios/` | `servicios.html` | wayback-20221002193329 | ✅ OK |
| `/tarifas/` | `tarifas.html` | wayback-20220817010230 | ✅ OK |

## Páginas NO recuperadas (requieren reintento o upload manual)

| Ruta | Snapshot intentado | Notas |
|------|-------------------|-------|
| `/reserva-clases/` | 20221002201700 | Wayback 404 |
| `/nuestro-equipo/` | 20220817002655 | Wayback 404 — **bios/fotos equipo pendientes** |
| `/blog/` | 20221002201700 | Wayback 404 |
| `/preguntas-frecuentes/` | 20221002183458 | Wayback 404 — FAQs desde KB §1.6 |
| `/politica-de-privacidad/` | 20221002201700 | Wayback 404 — reescribir RGPD |
| `/club-explora-en-sierra-nevada/` | 20221002201700 | Wayback 404 |
| `/category/recomendaciones/` | 20221002201700 | Wayback 404 |
| `/sitemap.xml` | live + wayback | No disponible |
| 26 posts de blog | varios | Todos fallidos — slugs conservados para 301 |

---

## Textos clave extraídos (home 2022)

**H1:** Explora School & Club  
**Tagline:** Agrupación de instructores/as, fundada en 2010. Clases de Esquí, Snowboard, Telemark, Esquí adaptado, Freestyle y Freeride.

**Productos home (precios legado):**
- Full Day — desde 160 €
- Primeras Huellas — desde 110 € (9h–12h)
- Clases Forfait medio día — desde 65 €
- Clase Grabada — desde 20 €

**IVA incluido · ESPAÑOL & INGLÉS**

**Contacto (contacto.html):**
- Tel: (+34) 660 262 790
- Email: explora.sclub@gmail.com
- Dirección: Sierra Nevada, Granada (Spain) CP 18196
- Horario: Lunes–Domingo 9am a 6pm

**Tarifas (tarifas.html):** Tabla completa agosto 2022 extraída en `src/data/prices.ts`

---

## Imágenes identificadas (NO descargadas — servidor caído)

Todas las URLs están en el HTML. Subir manualmente a `public/images/legacy/` cuando el hosting WP vuelva o desde backup Creadigital.

| URL original | Nombre local sugerido | Uso |
|-------------|----------------------|-----|
| `.../2021/02/cropped-Logo-Explora-PNG-512-X-512-fondo-transparante.png` | `logo-explora-512.png` | Logo, OG, favicon |
| `.../2021/03/Logo-Explora-PNG-1024-x-1024-fondo-transparente.png` | `logo-explora-1024.png` | Header |
| `.../2019/02/portada-alumnosinstructores.jpg` | `hero-alumnos-instructores.jpg` | Hero principal |
| `.../2021/09/instructores-espaldas-1024x406-1.jpg` | `instructores-espaldas.jpg` | Home equipo |
| `.../2021/09/grupo-Ale-snow.jpeg` | `clase-snow-grupo.jpeg` | Servicios |
| `.../2021/09/Teleferico-2.png` | `icon-teleferico.png` | Iconografía |
| `.../2021/09/Ski-1.png` | `icon-ski.png` | Disciplinas |
| `.../2021/09/water-ski.png` | `icon-water-ski.png` | Disciplinas |
| `.../2021/09/glasses-Snow.png` | `icon-glasses-snow.png` | Disciplinas |

**Fotos instructores individuales:** No presentes en HTML scrapeado (página `/nuestro-equipo/` no recuperada). Pendiente: scrape live o backup.

**Total URLs únicas en HTML:** 35  
**Descargadas:** 0  
**Comando reintento:** `node scripts/extract-images.mjs` (cuando live responda)

---

## Huecos críticos — acción requerida

1. **Imágenes:** Subir backup desde Creadigital o reactivar WP temporalmente
2. **Equipo:** Confirmar bios de Estrella, Benja, Ferran en scrape live
3. **Precios 2025/26:** Home actual menciona Full Day +25€/pax extra y Curso Snow 60€ — confirmar en vivo
4. **Blog:** 26 artículos — migrar HTML cuando Wayback/live disponible
5. **Privacidad:** Texto nov 2024 en brief — reescribir con Firebase/GCP

---

## Scripts disponibles

```bash
npm run scrape          # Crawl completo live + wayback
node scripts/extract-images.mjs  # Descarga imágenes de HTML existente
npm run upload-legacy   # Sube a Firebase Storage (requiere env)
npm run seed            # Seed Firestore
```

---

## Fuentes de verdad aplicadas

1. Scrape Wayback (4 páginas) — prioridad cuando contradice KB
2. Brief maestro §1 — fallback para FAQs, equipo, reseñas, tarifas
3. Live — pendiente revalidación cuando `sierranevadaclases.es` responda
