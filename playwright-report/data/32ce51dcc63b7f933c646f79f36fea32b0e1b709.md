# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dividas.spec.ts >> Sistema de Dívidas - JC Soluções >> deve carregar a página inicial
- Location: tests\dividas.spec.ts:4:7

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /JC Soluções/
Received string:  ""
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    14 × unexpected value ""

```

```yaml
- navigation:
  - button "previous" [disabled]:
    - img "previous"
  - text: 1/1
  - button "next" [disabled]:
    - img "next"
- img
- img
- text: Next.js 16.2.6 Turbopack
- img
- dialog "Build Error":
  - text: Build Error
  - button "Copy Error Info":
    - img
  - button "No related documentation found" [disabled]:
    - img
  - button "Attach Node.js inspector":
    - img
  - text: Error parsing package.json file
  - img
  - text: ./package.json (1:1)
  - button "Open in editor":
    - img
  - text: "Error parsing package.json file > 1 | { | ^ 2 | \"name\": \"sistema-dividas\", 3 | \"version\": \"0.1.0\", 4 | \"private\": true, package.json is not parseable: invalid JSON: expected value at line 1 column 1"
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- alert
```

# Test source

```ts
  1   | ﻿import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Sistema de Dívidas - JC Soluções', () => {
  4   |   test('deve carregar a página inicial', async ({ page }) => {
  5   |     await page.goto('http://localhost:3000');
> 6   |     await expect(page).toHaveTitle(/JC Soluções/);
      |                        ^ Error: expect(page).toHaveTitle(expected) failed
  7   |   });
  8   | 
  9   |   test('deve fazer login com sucesso', async ({ page }) => {
  10  |     await page.goto('http://localhost:3000/login');
  11  |     
  12  |     // Preencher formulário de login
  13  |     await page.fill('input[type="email"]', 'jc@dimas.com');
  14  |     await page.fill('input[type="password"]', 'dimas2026');
  15  |     
  16  |     // Clicar no botão de login
  17  |     await page.click('button[type="submit"]');
  18  |     
  19  |     // Aguardar redirecionamento para o dashboard
  20  |     await page.waitForURL(/\/dashboard/);
  21  |     await expect(page).toHaveURL(/dashboard/);
  22  |   });
  23  | 
  24  |   test('deve exibir cards de estatísticas no dashboard', async ({ page }) => {
  25  |     await page.goto('http://localhost:3000/login');
  26  |     await page.fill('input[type="email"]', 'jc@dimas.com');
  27  |     await page.fill('input[type="password"]', 'dimas2026');
  28  |     await page.click('button[type="submit"]');
  29  |     await page.waitForURL(/\/dashboard/);
  30  | 
  31  |     // Verificar cards de estatísticas
  32  |     await expect(page.locator('text=Total Geral')).toBeVisible();
  33  |     await expect(page.locator('text=Total Pago')).toBeVisible();
  34  |     await expect(page.locator('text=Total a Receber')).toBeVisible();
  35  |     await expect(page.locator('text=Devedores')).toBeVisible();
  36  |   });
  37  | 
  38  |   test('deve cadastrar nova dívida', async ({ page }) => {
  39  |     await page.goto('http://localhost:3000/login');
  40  |     await page.fill('input[type="email"]', 'jc@dimas.com');
  41  |     await page.fill('input[type="password"]', 'dimas2026');
  42  |     await page.click('button[type="submit"]');
  43  |     await page.waitForURL(/\/dashboard/);
  44  | 
  45  |     // Clicar em "Nova Dívida"
  46  |     await page.click('text=Nova Dívida');
  47  |     await page.waitForURL(/\/cadastrar/);
  48  | 
  49  |     // Preencher formulário
  50  |     await page.fill('input[type="text"]', 'João da Silva');
  51  |     await page.fill('input[type="number"]', '1000');
  52  |     await page.fill('textarea', 'Empréstimo pessoal');
  53  |     
  54  |     // Salvar
  55  |     await page.click('button[type="submit"]');
  56  |     
  57  |     // Aguardar retorno ao dashboard
  58  |     await page.waitForURL(/\/dashboard/);
  59  |   });
  60  | 
  61  |   test('deve visualizar detalhes da dívida', async ({ page }) => {
  62  |     await page.goto('http://localhost:3000/login');
  63  |     await page.fill('input[type="email"]', 'jc@dimas.com');
  64  |     await page.fill('input[type="password"]', 'dimas2026');
  65  |     await page.click('button[type="submit"]');
  66  |     await page.waitForURL(/\/dashboard/);
  67  | 
  68  |     // Clicar em uma dívida
  69  |     const firstDivida = page.locator('text=Ver detalhes').first();
  70  |     if (await firstDivida.isVisible()) {
  71  |       await firstDivida.click();
  72  |       await expect(page.locator('text=Detalhes da Dívida')).toBeVisible();
  73  |     }
  74  |   });
  75  | 
  76  |   test('deve editar dívida', async ({ page }) => {
  77  |     await page.goto('http://localhost:3000/login');
  78  |     await page.fill('input[type="email"]', 'jc@dimas.com');
  79  |     await page.fill('input[type="password"]', 'dimas2026');
  80  |     await page.click('button[type="submit"]');
  81  |     await page.waitForURL(/\/dashboard/);
  82  | 
  83  |     // Clicar em editar
  84  |     const editButton = page.locator('button[title="Editar"]').first();
  85  |     if (await editButton.isVisible()) {
  86  |       await editButton.click();
  87  |       await expect(page.locator('text=Salvar Alterações')).toBeVisible();
  88  |     }
  89  |   });
  90  | 
  91  |   test('deve fazer logout', async ({ page }) => {
  92  |     await page.goto('http://localhost:3000/login');
  93  |     await page.fill('input[type="email"]', 'jc@dimas.com');
  94  |     await page.fill('input[type="password"]', 'dimas2026');
  95  |     await page.click('button[type="submit"]');
  96  |     await page.waitForURL(/\/dashboard/);
  97  | 
  98  |     // Clicar em Sair
  99  |     await page.click('button:has-text("Sair")');
  100 |     
  101 |     // Aguardar redirecionamento para login
  102 |     await page.waitForURL(/\/login/);
  103 |     await expect(page).toHaveURL(/login/);
  104 |   });
  105 | });
```