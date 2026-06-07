#!/usr/bin/env node
/**
 * Gera hash SHA-256 de token para config.js
 * Uso: node scripts/hash-token.js ADMIN001
 *      TOKEN_PEPPER=seu-pepper node scripts/hash-token.js ADMIN001
 */
const crypto = require("crypto");

const token = process.argv[2];
if (!token) {
  console.error("Uso: node scripts/hash-token.js SEU_TOKEN");
  process.exit(1);
}

const pepper =
  process.env.TOKEN_PEPPER ||
  "jc-demo-pepper-change-in-production-2026";

const normalized = String(token).toUpperCase().replace(/[^A-Z0-9]/g, "");
const hash = crypto.createHash("sha256").update(normalized + pepper).digest("hex");

console.log("Token normalizado:", normalized);
console.log("Pepper:", pepper);
console.log("ADMIN_TOKEN_HASH / tokenHash:", hash);
