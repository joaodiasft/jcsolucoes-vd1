import { test, expect } from '@playwright/test';

test.describe('Sistema de Dívidas - JC Soluções', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/JC Soluções/);
  });

  test('deve fazer login com sucesso', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Preencher formulário de login
    await page.fill('input[type="email"]', 'jc@dimas.com');
    await page.fill('input[type="password"]', 'dimas2026');
    
    // Clicar no botão de login
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento para o dashboard
    await page.waitForURL(/\/dashboard/);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('deve exibir cards de estatísticas no dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'jc@dimas.com');
    await page.fill('input[type="password"]', 'dimas2026');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // Verificar cards de estatísticas
    await expect(page.locator('text=Total Geral')).toBeVisible();
    await expect(page.locator('text=Total Pago')).toBeVisible();
    await expect(page.locator('text=Total a Receber')).toBeVisible();
    await expect(page.locator('text=Devedores')).toBeVisible();
  });

  test('deve cadastrar nova dívida', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'jc@dimas.com');
    await page.fill('input[type="password"]', 'dimas2026');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // Clicar em "Nova Dívida"
    await page.click('text=Nova Dívida');
    await page.waitForURL(/\/cadastrar/);

    // Preencher formulário
    await page.fill('input[type="text"]', 'João da Silva');
    await page.fill('input[type="number"]', '1000');
    await page.fill('textarea', 'Empréstimo pessoal');
    
    // Salvar
    await page.click('button[type="submit"]');
    
    // Aguardar retorno ao dashboard
    await page.waitForURL(/\/dashboard/);
  });

  test('deve visualizar detalhes da dívida', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'jc@dimas.com');
    await page.fill('input[type="password"]', 'dimas2026');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // Clicar em uma dívida
    const firstDivida = page.locator('text=Ver detalhes').first();
    if (await firstDivida.isVisible()) {
      await firstDivida.click();
      await expect(page.locator('text=Detalhes da Dívida')).toBeVisible();
    }
  });

  test('deve editar dívida', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'jc@dimas.com');
    await page.fill('input[type="password"]', 'dimas2026');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // Clicar em editar
    const editButton = page.locator('button[title="Editar"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await expect(page.locator('text=Salvar Alterações')).toBeVisible();
    }
  });

  test('deve fazer logout', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'jc@dimas.com');
    await page.fill('input[type="password"]', 'dimas2026');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // Clicar em Sair
    await page.click('button:has-text("Sair")');
    
    // Aguardar redirecionamento para login
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/login/);
  });
});