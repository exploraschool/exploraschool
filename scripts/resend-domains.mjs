const key = process.argv[2];
if (!key?.startsWith("re_")) {
  console.error("Usage: node scripts/resend-domains.mjs re_xxx [create|verify]");
  process.exit(1);
}

const action = process.argv[3] ?? "list";
const domain = "explora-school.es";

async function api(path, options = {}) {
  const response = await fetch(`https://api.resend.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "User-Agent": "exploraschool/1.0",
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`${response.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

if (action === "list") {
  const data = await api("/domains");
  console.log(JSON.stringify(data, null, 2));
}

if (action === "create") {
  const data = await api("/domains", {
    method: "POST",
    body: JSON.stringify({ name: domain }),
  });
  console.log(JSON.stringify(data, null, 2));
}

if (action === "get") {
  const list = await api("/domains");
  const match = list.data?.find((d) => d.name === domain);
  if (!match) throw new Error(`Domain ${domain} not found`);
  const data = await api(`/domains/${match.id}`);
  console.log(JSON.stringify(data, null, 2));
}

if (action === "verify") {
  const list = await api("/domains");
  const match = list.data?.find((d) => d.name === domain);
  if (!match) throw new Error(`Domain ${domain} not found`);
  const data = await api(`/domains/${match.id}/verify`, { method: "POST" });
  console.log(JSON.stringify(data, null, 2));
}
