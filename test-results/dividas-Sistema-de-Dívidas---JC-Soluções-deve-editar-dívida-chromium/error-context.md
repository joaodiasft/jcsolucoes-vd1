# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dividas.spec.ts >> Sistema de Dívidas - JC Soluções >> deve editar dívida
- Location: tests\dividas.spec.ts:76:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

```

# Page snapshot

```yaml
- generic:
  - generic [active]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - navigation [ref=e6]:
            - button "previous" [disabled] [ref=e7]:
              - img "previous" [ref=e8]
            - generic [ref=e10]:
              - generic [ref=e11]: 1/
              - text: "1"
            - button "next" [disabled] [ref=e12]:
              - img "next" [ref=e13]
          - img
        - generic [ref=e15]:
          - generic [ref=e16]:
            - img [ref=e17]
            - generic "Latest available version is detected (16.2.6)." [ref=e19]: Next.js 16.2.6
            - generic [ref=e20]: Turbopack
          - img
      - dialog "Build Error" [ref=e22]:
        - generic [ref=e25]:
          - generic [ref=e26]:
            - generic [ref=e27]:
              - generic [ref=e29]: Build Error
              - generic [ref=e30]:
                - button "Copy Error Info" [ref=e31] [cursor=pointer]:
                  - img [ref=e32]
                - button "No related documentation found" [disabled] [ref=e34]:
                  - img [ref=e35]
                - button "Attach Node.js inspector" [ref=e37] [cursor=pointer]:
                  - img [ref=e38]
            - generic [ref=e47]: Error parsing package.json file
          - generic [ref=e49]:
            - generic [ref=e51]:
              - img [ref=e53]
              - generic [ref=e55]: ./package.json (1:1)
              - button "Open in editor" [ref=e56] [cursor=pointer]:
                - img [ref=e58]
            - generic [ref=e61]:
              - generic [ref=e62]: Error parsing package.json file
              - text: ">"
              - generic [ref=e63]: 1 |
              - generic [ref=e64]: "{"
              - generic [ref=e65]: "|"
              - text: ^
              - generic [ref=e66]: 2 |
              - text: "\"name\""
              - generic [ref=e67]: ":"
              - text: "\"sistema-dividas\""
              - generic [ref=e68]: ","
              - generic [ref=e69]: 3 |
              - text: "\"version\""
              - generic [ref=e70]: ":"
              - text: "\"0.1.0\""
              - generic [ref=e71]: ","
              - generic [ref=e72]: 4 |
              - text: "\"private\""
              - generic [ref=e73]: ":"
              - text: "true"
              - generic [ref=e74]: ", package.json is not parseable: invalid JSON: expected value at line 1 column 1"
        - generic [ref=e75]: "1"
        - generic [ref=e76]: "2"
    - generic [ref=e81] [cursor=pointer]:
      - button "Open Next.js Dev Tools" [ref=e82]:
        - img [ref=e83]
      - button "Open issues overlay" [ref=e87]:
        - generic [ref=e88]:
          - generic [ref=e89]: "0"
          - generic [ref=e90]: "1"
        - generic [ref=e91]: Issue
  - alert [ref=e92]
```

# Test source

```ts
  1   | ﻿import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Sistema de Dívidas - JC Soluções', () => {
  4   |   test('deve carregar a página inicial', async ({ page }) => {
  5   |     await page.goto('http://localhost:3000');
  6   |     await expect(page).toHaveTitle(/JC Soluções/);
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
> 78  |     await page.fill('input[type="email"]', 'jc@dimas.com');
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
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