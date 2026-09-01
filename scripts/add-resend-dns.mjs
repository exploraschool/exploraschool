import { execSync } from "node:child_process";

const domain = "explora-school.es";

const records = [
  {
    name: "resend._domainkey",
    type: "TXT",
    value:
      "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC2oTvVkqYVXrrKVZIvChWqU93jJPniw5q1lVI+KP4LWBmAIBTZrgqVXnxRC/m+XLa1LjVp3lKJ3anq53sIH8Sv046o598INIBuYmVYHQkft7SSJkaE9UyuNp8tQJAFU/a4EEzparWHCmhNn6Ej1hS69qCy1fEy7zSrKDJfDCyi+QIDAQAB",
  },
  {
    name: "send",
    type: "MX",
    value: "10 feedback-smtp.us-east-1.amazonses.com",
  },
  {
    name: "send",
    type: "TXT",
    value: "v=spf1 include:amazonses.com ~all",
  },
];

for (const record of records) {
  const command = `npx vercel dns add ${domain} ${record.name} ${record.type} ${JSON.stringify(record.value)}`;
  console.log(`> ${command}`);
  try {
    execSync(command, { stdio: "inherit", shell: true, cwd: process.cwd() });
  } catch (error) {
    console.error(`Failed: ${record.name} ${record.type}`);
  }
}

console.log("Current DNS records:");
execSync(`npx vercel dns ls ${domain}`, { stdio: "inherit", shell: true });
