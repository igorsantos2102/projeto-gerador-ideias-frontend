import { test, expect } from '@playwright/test'

test.describe('Favoritos', () => {
  test('usuario visualiza e remove ideias favoritas', async ({ page }) => {
    const favorites = [
      {
        id: 'fav-1',
        theme: 'Tecnologia',
        context: 'Produtos IA',
        content: 'Assistente que gera pitch automaticamente.',
        timestamp: new Date('2025-03-18T12:00:00Z').toISOString(),
        isFavorite: true,
      },
      {
        id: 'fav-2',
        theme: 'Educação',
        context: 'Estudos',
        content: 'Plataforma que personaliza cronogramas.',
        timestamp: new Date('2025-03-19T15:30:00Z').toISOString(),
        isFavorite: true,
      },
    ]

    await page.route('**/api/ideas/favorites', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(favorites),
      })
    })

    await page.route('**/api/ideas/*/favorite', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.goto('/favorites')

    await expect(page.getByRole('heading', { name: /favoritos/i })).toBeVisible()
    await expect(page.getByText(favorites[0].content)).toBeVisible()
    await expect(page.getByText(favorites[1].content)).toBeVisible()

    const unfavoriteButton = page.getByRole('button', { name: /desfavoritar/i }).first()
    await unfavoriteButton.click()

    await expect(page.getByText(favorites[0].content)).toHaveCount(0)
    await expect(page.getByText(favorites[1].content)).toBeVisible()
  })
})
