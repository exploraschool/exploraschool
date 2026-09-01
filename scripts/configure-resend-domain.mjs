import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const apiKey = process.argv[2];
const from = process.argv[3] ?? "Explora School <reservas@explora-school.es>";

if (!apiKey?.startsWith("re_")) {
  console.error("Usage: node scripts/configure-resend-domain.mjs re_xxx [from]");
  process.exit(1);
}

const domain = "explora-school.es";

async function resend(path, options = {}) {
  const response = await fetch(`https://api.resend.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "exploraschool/1.0",
    },
  });
  const json = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(json));
  return json;
}

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit", shell: true });
}

async function getDomain() {
  const list = await resend("/domains");
  const match = list.data?.find((d) => d.name === domain);
  if (!match) throw new Error(`Domain ${domain} not found in Resend`);
  return resend(`/domains/${match.id}`);
}

console.log("Updating RESEND_FROM on Vercel...");
run(`npx vercel env update RESEND_FROM production --value ${JSON.stringify(from)} -y --sensitive`);

console.log("Updating RESEND_FROM on Firebase...");
run(`firebase functions:config:set resend.from=${JSON.stringify(from)} 2>nul || echo skip legacy config`);

// Firebase v2 uses defineString - update via .env.exploraschool-9ea82
const envPath = "functions/.env.exploraschool-9ea82";
let envContent = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
if (/^RESEND_FROM=/m.test(envContent)) {
  envContent = envContent.replace(/^RESEND_FROM=.*$/m, `RESEND_FROM=${from}`);
} else {
  envContent += `${envContent.endsWith("\n") || envContent.length === 0 ? "" : "\n"}RESEND_FROM=${from}\n`;
}
writeFileSync(envPath, envContent);

console.log("Requesting domain verification...");
const listed = await resend("/domains");
const item = listed.data?.find((d) => d.name === domain);
if (item) {
  await resend(`/domains/${item.id}/verify`, { method: "POST" });
}

let status = "pending";
for (let attempt = 1; attempt <= 12; attempt++) {
  const info = await getDomain();
  status = info.status;
  console.log(`Verification attempt ${attempt}/12: ${status}`);
  if (status === "verified") break;
  await new Promise((r) => setTimeout(r, 10000));
}

if (status !== "verified") {
  console.log("\nDomain still pending. DNS records are in Vercel but nameservers must point to Vercel:");
  console.log("  ns1.vercel-dns.com");
  console.log("  ns2.vercel-dns.com");
  console.log("Change them in Hostinger → Dominios → explora-school.es → Nameservers.");
  process.exit(2);
}

console.log("Domain verified. Deploying Firebase functions...");
run("firebase deploy --only functions");

const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "User-Agent": "exploraschool/1.0",
  },
  body: JSON.stringify({
    from,
    to: ["explora.sclub@gmail.com"],
    subject: "Explora School — dominio verificado",
    html: "<p>Los emails de confirmación ya pueden enviarse desde reservas@explora-school.es</p>",
  }),
});
const body = await response.text();
console.log("Test email:", response.status, body.slice(0, 200));

console.log("Redeploying Vercel production...");
run("npx vercel deploy --prod --yes");

console.log("Done.");
