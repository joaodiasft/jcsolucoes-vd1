/**
 * ============================================================================
 * JCPag — Módulo de criptografia (NÃO EDITAR)
 * AES-256-GCM + PBKDF2 via Web Crypto API
 * ============================================================================
 */
"use strict";

window.JCPagCrypto = (function () {
  const SALT_KEY = "jc-pag-crypto-salt-v1";
  const ENC_PREFIX = "JCPAG1:";

  function cfg() {
    const c = window.JCPAG_CONFIG;
    if (!c?.STORAGE_SECRET || c.STORAGE_SECRET.length < 32) {
      throw new Error("JCPAG_CONFIG.STORAGE_SECRET inválido (mínimo 32 caracteres).");
    }
    return c;
  }

  function bufToB64(buf) {
    const bytes = new Uint8Array(buf);
    let bin = "";
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin);
  }

  function b64ToBuf(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }

  function getOrCreateSalt() {
    let saltB64 = localStorage.getItem(SALT_KEY);
    if (!saltB64) {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      saltB64 = bufToB64(salt);
      localStorage.setItem(SALT_KEY, saltB64);
    }
    return new Uint8Array(b64ToBuf(saltB64));
  }

  async function deriveKey(secret) {
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      "PBKDF2",
      false,
      ["deriveKey"],
    );
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: getOrCreateSalt(),
        iterations: 310000,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
  }

  async function encrypt(plainText) {
    const key = await deriveKey(cfg().STORAGE_SECRET);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const cipher = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      enc.encode(plainText),
    );
    return ENC_PREFIX + bufToB64(iv) + "." + bufToB64(cipher);
  }

  async function decrypt(payload) {
    if (!payload || !payload.startsWith(ENC_PREFIX)) {
      throw new Error("Payload criptografado inválido ou legado não suportado.");
    }
    const body = payload.slice(ENC_PREFIX.length);
    const [ivB64, dataB64] = body.split(".");
    if (!ivB64 || !dataB64) throw new Error("Formato de criptografia corrompido.");

    const key = await deriveKey(cfg().STORAGE_SECRET);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(b64ToBuf(ivB64)) },
      key,
      b64ToBuf(dataB64),
    );
    return new TextDecoder().decode(plain);
  }

  async function sha256Hex(text) {
    const enc = new TextEncoder();
    const hash = await crypto.subtle.digest("SHA-256", enc.encode(text));
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function hmacSign(message, secret) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
    return bufToB64(sig);
  }

  async function hmacVerify(message, signature, secret) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    return crypto.subtle.verify("HMAC", key, b64ToBuf(signature), enc.encode(message));
  }

  function randomSid() {
    const a = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  return Object.freeze({
    encrypt,
    decrypt,
    sha256Hex,
    hmacSign,
    hmacVerify,
    randomSid,
    ENC_PREFIX,
  });
})();
