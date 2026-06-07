# Setup de segredos via 1Password CLI
# Uso: .\scripts\setup-secrets.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (-not (Get-Command op -ErrorAction SilentlyContinue)) {
  Write-Host "1Password CLI nao encontrado." -ForegroundColor Red
  Write-Host "Instale: https://developer.1password.com/docs/cli/get-started/" -ForegroundColor Yellow
  Write-Host "Windows: winget install AgileBits.1Password.CLI" -ForegroundColor Yellow
  exit 1
}

Write-Host "Verificando sessao 1Password..." -ForegroundColor Cyan
$whoami = op whoami 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Faca login: op signin" -ForegroundColor Yellow
  op signin
}

if (-not (Test-Path "config.local.op.tpl.js")) {
  Write-Host "Arquivo config.local.op.tpl.js nao encontrado." -ForegroundColor Red
  exit 1
}

Write-Host "Gerando config.local.js (segredos NAO aparecem no terminal)..." -ForegroundColor Cyan
op inject -i config.local.op.tpl.js -o config.local.js -f

if ($LASTEXITCODE -eq 0) {
  Write-Host "config.local.js gerado com sucesso." -ForegroundColor Green
  Write-Host "Nunca commite config.local.js — ja esta no .gitignore." -ForegroundColor Yellow
} else {
  Write-Host "Falha no op inject. Verifique os caminhos op:// no template." -ForegroundColor Red
  exit 1
}
