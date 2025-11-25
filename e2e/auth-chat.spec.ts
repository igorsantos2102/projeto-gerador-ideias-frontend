import { test, expect } from '@playwright/test'

test.describe('Fluxos de autenticacao e chatbot', () => {
  test('usuario consegue registrar nova conta', async ({ page }) => {
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'user-1' }),
      })
    })

    await page.goto('/register')

    await page.getByLabel('Nome Completo').fill('Usuário Teste')
    await page.getByLabel('Email').fill('novo@exemplo.com')
    await page.getByLabel(/^Senha$/i).fill('Senha@123')
    await page.getByLabel(/confirmar senha/i).fill('Senha@123')
    await page.getByRole('button', { name: /criar conta/i }).click()

    await expect(page).toHaveURL(/\/login$/)
  })

  test('usuario faz login e acessa o gerador de ideias', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'access-123',
          refreshToken: 'refresh-456',
          uuid: 'user-1',
          name: 'Tester',
          email: 'user@example.com',
        }),
      })
    })

    await page.goto('/login')
    await page.getByLabel(/email/i).fill('user@example.com')
    await page.getByLabel(/senha/i).fill('Senha@123')
    await page.getByRole('button', { name: /fazer login/i }).click()

    await expect(page).toHaveURL(/\/generator$/)
  })
})
