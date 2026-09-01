/**
 * Add Resend DNS records to Hostinger (authoritative DNS for explora-school.es).
 * Usage: set HOSTINGER_API_TOKEN=... && node scripts/hostinger-dns-resend.mjs
 */
const token = process.env.HOSTINGER_API_TOKEN;
const domain = "explora-school.es";

if (!token) {
  console.error("Set HOSTINGER_API_TOKEN (from hPanel → API)");
  process.exit(1);
}

const newRecords = [
  {
    name: "resend._domainkey",
    type: "TXT",
    ttl: 300,
    records: [
      {
        content:
          "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC2oTvVkqYVXrrKVZIvChWqU93jJPniw5q1lVI+KP4LWBmAIBTZrgqVXnxRC/m+XLa1LjVp3lKJ3anq53sIH8Sv046o598INIBuYmVYHQkft7SSJkaE9UyuNp8tQJAFU/a4EEzparWHCmhNn6Ej1hS69qCy1fEy7zSrKDJfDCyi+QIDAQAB",
      },
    ],
  },
  {
    name: "send",
    type: "TXT",
    ttl: 300,
    records: [{ content: "v=spf1 include:amazonses.com ~all" }],
  },
  {
    name: "send",
    type: "MX",
    ttl: 300,
    records: [{ content: "feedback-smtp.us-east-1.amazonses.com", priority: 10 }],
  },
];

const response = await fetch(`https://developers.hostinger.com/api/dns/v1/zones/${domain}`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    overwrite: false,
    zone: newRecords,
  }),
});

const body = await response.text();
console.log(response.status, body.slice(0, 500));
if (!response.ok) process.exit(1);

console.log("Hostinger DNS records added.");
