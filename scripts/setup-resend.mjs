#!/usr/bin/env node
/**
 * Configure Resend across Vercel + Firebase from a single valid API key.
 * Usage: node scripts/setup-resend.mjs re_your_api_key_here
 */
import { execSync } from "node:child_process";

const apiKey = process.argv[2]?.trim();

if (!apiKey || !apiKey.startsWith("re_")) {
  console.error("Usage: node scripts/setup-resend.mjs re_xxxxxxxx");
  process.exit(1);
}

function run(command) {
  console.log(`> ${command.replace(apiKey, "re_***")}`);
  execSync(command, { stdio: "inherit", shell: true });
}

async function testKey(key, from) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "User-Agent": "exploraschool/1.0",
    },
    body: JSON.stringify({
      from,
      to: ["explora.sclub@gmail.com"],
      subject: "Explora School — Resend configurado",
      html: "<p>La API key de Resend funciona correctamente.</p>",
    }),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Resend test failed (${response.status}): ${body}`);
  }
  console.log("Resend test email sent to explora.sclub@gmail.com");
}

const from = process.env.RESEND_FROM ?? "Explora School <onboarding@resend.dev>";

console.log("Testing API key...");
await testKey(apiKey, from);

console.log("Updating Vercel production env...");
run(`npx vercel env update RESEND_API_KEY production --value "${apiKey}" -y --sensitive`);

console.log("Updating Firebase secret...");
execSync(`firebase functions:secrets:set RESEND_API_KEY`, {
  input: apiKey,
  stdio: ["pipe", "inherit", "inherit"],
  shell: true,
});

console.log("Deploying Firebase functions...");
run("firebase deploy --only functions");

console.log("Done. Confirm a booking in /admin/leads to verify customer emails.");
