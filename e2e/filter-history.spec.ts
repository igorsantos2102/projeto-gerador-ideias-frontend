import { test, expect } from '@playwright/test'

test.describe('FilterHistory E2E', () => {
  test.beforeEach(async ({ page }) => {

    // Mock ideas by theme
    await page.route('**/api/ideas/history**', async (route) => {
      const url = new URL(route.request().url())
      const theme = url.searchParams.get('theme')
      const ideas =
        theme === 'estudos'
          ? [
              {
                id: '2',
                theme: 'Estudos',
                context: 'EAD',
                content: 'Ideia Estudos 1',
                timestamp: new Date().toISOString(),
                isFavorite: false,
              },
            ]
          : [
              {
                id: '1',
                theme: 'Tecnologia',
                context: 'IA',
                content: 'Ideia Tecnologia 1',
                timestamp: new Date().toISOString(),
                isFavorite: true,
              },
              {
                id: '3',
                theme: 'Tecnologia',
                context: 'DevTools',
                content: 'Ideia Tecnologia 2',
                timestamp: new Date().toISOString(),
                isFavorite: false,
              },
            ]
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ideas),
      })
    })
  })

  test('filtra por categoria, limpa filtros e mostra resultados', async ({ page }) => {
    await page.goto('/history')

    // Aguarda carregar ideias iniciais (tecnologia)
    await expect(page.getByText('Ideia Tecnologia 1')).toBeVisible()

    // Seleciona outra categoria
    await page.getByLabel('Categoria').selectOption('estudos')
    await expect(page.getByText('Ideia Estudos 1')).toBeVisible()

    // Limpar filtros volta aos resultados iniciais
    await page.getByRole('button', { name: /limpar filtros/i }).click()
    await expect(page.getByText('Ideia Tecnologia 2')).toBeVisible()
  })
})
