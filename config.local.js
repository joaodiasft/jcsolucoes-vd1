/**
 * Overrides opcionais — sobrescreve config.example.js
 * Para segredos locais, descomente e altere. NÃO commite valores sensíveis.
 */
if (typeof window.JCPAG_CONFIG !== "undefined") {
  Object.assign(window.JCPAG_CONFIG, {
    // STORAGE_SECRET: "sua-chave-local-32-caracteres-minimo!!",
  });
}
