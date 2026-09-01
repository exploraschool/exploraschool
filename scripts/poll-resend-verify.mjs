const apiKey = process.argv[2];
const domainId = "e408c068-e922-4c19-8f7e-e9b47b2615e3";

async function getStatus() {
  const response = await fetch(`https://api.resend.com/domains/${domainId}`, {
    headers: { Authorization: `Bearer ${apiKey}`, "User-Agent": "exploraschool/1.0" },
  });
  return response.json();
}

for (let i = 1; i <= 8; i++) {
  await fetch(`https://api.resend.com/domains/${domainId}/verify`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "User-Agent": "exploraschool/1.0" },
  });
  const data = await getStatus();
  const records = data.records?.map((r) => `${r.record}:${r.status}`).join(", ") ?? "";
  console.log(`Attempt ${i}: ${data.status} (${records})`);
  if (data.status === "verified") break;
  await new Promise((r) => setTimeout(r, 15000));
}

const final = await getStatus();
if (final.status !== "verified") {
  process.exit(2);
}

const test = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "User-Agent": "exploraschool/1.0",
  },
  body: JSON.stringify({
    from: "Explora School <reservas@explora-school.es>",
    to: ["explora.sclub@gmail.com"],
    subject: "Explora School — dominio verificado",
    html: "<p>Los emails de confirmación de reserva ya se envían desde reservas@explora-school.es</p>",
  }),
});

const body = await test.text();
console.log("Test email:", test.status, body.slice(0, 200));
