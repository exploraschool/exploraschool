#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";

const instructors = [
  { slug: "reche", initials: "RE", color: "#1F4E5F" },
  { slug: "patri", initials: "PA", color: "#2A6B7C" },
  { slug: "lalo", initials: "LA", color: "#E4572E" },
  { slug: "jorge", initials: "JO", color: "#0E1A24" },
  { slug: "esau", initials: "ES", color: "#3D7A8C" },
  { slug: "aitana", initials: "AI", color: "#C4A574" },
  { slug: "estrella", initials: "ES", color: "#1F4E5F" },
  { slug: "ale", initials: "AL", color: "#E4572E" },
  { slug: "benja", initials: "BE", color: "#2A6B7C" },
  { slug: "ferran", initials: "FE", color: "#0E1A24" },
];

const dir = path.join("public", "images", "instructors");
fs.mkdirSync(dir, { recursive: true });

for (const { slug, initials, color } of instructors) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img"><rect width="400" height="400" fill="${color}"/><circle cx="200" cy="150" r="80" fill="#F4F7FA" opacity="0.12"/><text x="200" y="230" text-anchor="middle" font-family="Georgia,serif" font-size="96" font-weight="600" fill="#F4F7FA">${initials}</text></svg>`;
  fs.writeFileSync(path.join(dir, `${slug}.svg`), svg);
}

console.log(`Created ${instructors.length} instructor avatars`);
