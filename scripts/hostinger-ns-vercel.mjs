/**
 * Point explora-school.es nameservers to Vercel (Resend DNS records already in Vercel DNS).
 * Usage: set HOSTINGER_API_TOKEN=... && node scripts/hostinger-ns-vercel.mjs
 */
const token = process.env.HOSTINGER_API_TOKEN;
const domain = "explora-school.es";

if (!token) {
  console.error("Set HOSTINGER_API_TOKEN from hPanel → Perfil → API");
  process.exit(1);
}

const response = await fetch(
  `https://developers.hostinger.com/api/domains/v1/portfolio/${domain}/nameservers`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      nameservers: ["ns1.vercel-dns.com", "ns2.vercel-dns.com"],
    }),
  },
);

const body = await response.text();
console.log(response.status, body);
if (!response.ok) process.exit(1);

console.log("Nameservers updated. Waiting 60s for propagation...");
await new Promise((r) => setTimeout(r, 60000));

const verify = await fetch("https://api.resend.com/domains", {
  headers: {
    Authorization: `Bearer ${process.env.RESEND_API_KEY ?? ""}`,
    "User-Agent": "exploraschool/1.0",
  },
});

if (process.env.RESEND_API_KEY?.startsWith("re_")) {
  const list = await verify.json();
  const item = list.data?.find((d) => d.name === domain);
  if (item) {
    await fetch(`https://api.resend.com/domains/${item.id}/verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "User-Agent": "exploraschool/1.0",
      },
    });
    console.log("Resend verification triggered.");
  }
}

console.log("Done. Check https://resend.com/domains for verified status.");
