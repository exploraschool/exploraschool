import { mkdir, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "public", "images");

/**
 * Sierra Nevada (Granada) photos from Wikimedia Commons.
 * Licenses: CC BY-SA / CC BY — see public/images/sierra-nevada-ATTRIBUTION.md
 */
const sierraNevada = {
  borreguiles1:
    "https://upload.wikimedia.org/wikipedia/commons/d/da/Sierra_Nevada_Borreguiles_1.jpg",
  borreguiles2:
    "https://upload.wikimedia.org/wikipedia/commons/b/b2/Sierra_Nevada_Borreguiles_2.jpg",
  borreguiles3:
    "https://upload.wikimedia.org/wikipedia/commons/5/59/Sierra_Nevada_Borreguiles_3.jpg",
  borreguiles4:
    "https://upload.wikimedia.org/wikipedia/commons/9/9c/Sierra_Nevada_Borreguiles_4.jpg",
  borreguiles5:
    "https://upload.wikimedia.org/wikipedia/commons/7/7d/Sierra_Nevada_Borreguiles_5.jpg",
  borreguiles6:
    "https://upload.wikimedia.org/wikipedia/commons/1/1a/Sierra_Nevada_Borreguiles_6.jpg",
  borreguiles7:
    "https://upload.wikimedia.org/wikipedia/commons/9/95/Sierra_Nevada_Borreguiles_7.jpg",
  estacion2006:
    "https://upload.wikimedia.org/wikipedia/commons/9/95/Estaci%C3%B3n_de_esqu%C3%AD_de_Sierra_Nevada_%28ESP%29_2006.jpg",
  panorama:
    "https://upload.wikimedia.org/wikipedia/commons/a/a3/E-Sierra-Nevada-2.jpg",
  vistaBorreguiles1:
    "https://upload.wikimedia.org/wikipedia/commons/9/97/Vista_de_Borreguiles_%28128819633%29.jpg",
  vistaBorreguiles2:
    "https://upload.wikimedia.org/wikipedia/commons/1/15/Vista_desde_Borreguiles_%28128791695%29.jpg",
  vistaBorreguiles3:
    "https://upload.wikimedia.org/wikipedia/commons/2/22/Vista_desde_Borreguiles_%28128896610%29.jpg",
  borreguilesArea1:
    "https://upload.wikimedia.org/wikipedia/commons/0/03/Borreguiles_%28128818891%29.jpg",
  borreguilesArea2:
    "https://upload.wikimedia.org/wikipedia/commons/6/67/Borreguiles_%28128818926%29.jpg",
  telecabina2025:
    "https://upload.wikimedia.org/wikipedia/commons/2/25/2025_01_04_Visita_de_las_nuevas_cabinas_del_telecabina_Borreguiles_en_Sierra_Nevada.jpg",
  laVisera:
    "https://upload.wikimedia.org/wikipedia/commons/c/cd/La_Visera_desde_Borreguiles_%28128818986%29.jpg",
  zonaDebutantes1:
    "https://upload.wikimedia.org/wikipedia/commons/3/35/Zona_de_debutantes_%28128819061%29.jpg",
  zonaDebutantes2:
    "https://upload.wikimedia.org/wikipedia/commons/d/d9/Zona_de_debutantes_%28128819087%29.jpg",
  entrenamientosBaches:
    "https://upload.wikimedia.org/wikipedia/commons/a/ac/Entrenamientos_de_baches_%28128896892%29.jpg",
  estacionActiva:
    "https://upload.wikimedia.org/wikipedia/commons/e/ec/Sierra_Nevada_Ski_Station_%28128888774%29.jpg",
  panoramicaSierra:
    "https://upload.wikimedia.org/wikipedia/commons/2/2f/Panor%C3%A1mica_de_Sierra_Nevada_%28128820089%29.jpg",
  desdeTelecabina:
    "https://upload.wikimedia.org/wikipedia/commons/a/a5/Desde_el_telecabina_%28128818842%29.jpg",
  fueraDePista:
    "https://upload.wikimedia.org/wikipedia/commons/d/d5/Fuera_de_pista_en_Fuente_del_Tesoro_%28128818670%29.jpg",
  saltoFallido:
    "https://upload.wikimedia.org/wikipedia/commons/7/72/Sierra_Nevada_Ski_Station_%28128819805%29.jpg",
};

const images = {
  "stock/hero.jpg": sierraNevada.borreguiles6,
  "stock/gallery-01.jpg": sierraNevada.borreguiles5,
  "stock/gallery-02.jpg": sierraNevada.borreguiles7,
  "stock/gallery-03.jpg": sierraNevada.vistaBorreguiles2,
  "stock/gallery-04-panorama.jpg": sierraNevada.panoramicaSierra,
  "stock/gallery-05.jpg": sierraNevada.fueraDePista,
  "stock/gallery-06-gondola.jpg": sierraNevada.desdeTelecabina,
  "stock/discipline-esqui-pista.jpg": sierraNevada.estacionActiva,
  "stock/discipline-snowboard.jpg": sierraNevada.entrenamientosBaches,
  "stock/discipline-telemark.jpg": sierraNevada.borreguiles7,
  "stock/discipline-adaptado.jpg": sierraNevada.borreguilesArea1,
  "stock/discipline-freestyle.jpg": sierraNevada.borreguiles1,
  "stock/discipline-freeride.jpg": sierraNevada.fueraDePista,
  "stock/discipline-ninos.jpg": sierraNevada.borreguilesArea2,
  "stock/product-full-day-panorama.jpg": sierraNevada.vistaBorreguiles3,
  "stock/product-kids.jpg": sierraNevada.borreguilesArea2,
  "stock/product-tour.jpg": sierraNevada.vistaBorreguiles3,
  "stock/product-beginners.jpg": sierraNevada.zonaDebutantes2,
  "stock/product-technical.jpg": sierraNevada.borreguiles5,
  "stock/product-afternoon.jpg": sierraNevada.vistaBorreguiles1,
  "stock/product-snowboard-course.jpg": sierraNevada.borreguiles3,
  "stock/product-private-zona.jpg": sierraNevada.zonaDebutantes2,
  "stock/product-corporate.jpg": sierraNevada.panorama,
  "stock/product-group.jpg": sierraNevada.estacion2006,
  "stock/video-poster.jpg": sierraNevada.telecabina2025,
  "stock/team-backs.jpg": sierraNevada.vistaBorreguiles2,
};

async function download(relativePath, url, attempt = 1, force = false) {
  const dest = path.join(root, relativePath);
  try {
    if (!force) {
      await access(dest, constants.F_OK);
      console.log(`· ${relativePath} (already exists)`);
      return;
    }
  } catch {
    // continue
  }

  await mkdir(path.dirname(dest), { recursive: true });
  const res = await fetch(url, {
    headers: { "User-Agent": "ExploraSchool/1.0 (Sierra Nevada image setup)" },
  });

  if (res.status === 429 && attempt < 6) {
    const wait = attempt * 3000;
    console.log(`… ${relativePath} rate limited, retry in ${wait / 1000}s`);
    await sleep(wait);
    return download(relativePath, url, attempt + 1);
  }

  if (!res.ok) throw new Error(`Failed ${relativePath}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  console.log(`✓ ${relativePath} (${Math.round(buf.length / 1024)} KB)`);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const forceFiles = new Set(process.argv.includes("--force") ? Object.keys(images) : []);

for (const [file, url] of Object.entries(images)) {
  await download(file, url, 1, forceFiles.has(file));
  await sleep(2500);
}

console.log(`\nDownloaded ${Object.keys(images).length} Sierra Nevada images.`);
