import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { GeneratorPage } from '../GeneratorPage'
import { ideaService } from '@/services/ideaService'
import type { Idea } from '@/components/IdeiaCard/BaseIdeiaCard'

vi.mock('@/services/ideaService')
vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}))

const mockIdeaService = vi.mocked(ideaService)

type User = ReturnType<typeof userEvent.setup>

const mockIdea: Idea = {
  id: '1',
  theme: 'Tecnologia',
  content: 'IA que aprende com dados do usuário',
  timestamp: new Date(),
  isFavorite: false,
  context: 'Pitch para app',
}

const mockSurpriseIdea: Idea = {
  id: '2',
  theme: 'Viagem',
  content: 'App que conecta viajantes com locais autênticos',
  timestamp: new Date(),
  isFavorite: false,
  context: 'Plataforma para conectar viajantes',
}

async function createIdea(user: User) {
  const generateButton = screen.getByRole('button', { name: /gerar ideia/i })
  expect(generateButton).not.toBeDisabled()
  await user.click(generateButton)
  await screen.findByText(/ia que aprende/i)
}

describe('GeneratorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exibe estado inicial com CTA desabilitado', () => {
    renderWithProviders(<GeneratorPage disableChatWidget />)
    expect(
      screen.getByText(/Digite um tema e contexto para gerar sua primeira ideia/i)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /gerar ideia/i })).toBeDisabled()
  })

  it('gera uma ideia quando tema e contexto são preenchidos', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    mockIdeaService.generateIdea.mockResolvedValue(mockIdea)
    
    renderWithProviders(
      <GeneratorPage defaultContext="Pitch para app" disableChatWidget />
    )

    const user = userEvent.setup()
    
    // Seleciona o tema Tecnologia
    const themeButton = screen.getByText(/escolha o tema/i)
    await user.click(themeButton)
    const tecnologiaOption = await screen.findByText('Tecnologia')
    await user.click(tecnologiaOption)

    // Aguarda o estado ser atualizado e o botão ficar habilitado
    const generateButton = await screen.findByRole('button', { name: /gerar ideia/i })
    await waitFor(() => {
      expect(generateButton).not.toBeDisabled()
    })

    await createIdea(user)

    const ideasCard = screen.getByText(/ideias geradas/i).closest('section')!
    expect(within(ideasCard).getByText('1')).toBeInTheDocument()

    const favoritesCard = screen.getByText(/favoritas/i).closest('section')!
    expect(within(favoritesCard).getByText('0')).toBeInTheDocument()
  })

  it('permite favoritar a ideia atual e atualiza os indicadores', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    mockIdeaService.generateIdea.mockResolvedValue(mockIdea)
    mockIdeaService.toggleFavorite.mockResolvedValue(undefined)
    
    renderWithProviders(
      <GeneratorPage defaultContext="Pitch para app" disableChatWidget />
    )

    const user = userEvent.setup()
    
    // Seleciona o tema Tecnologia
    const themeButton = screen.getByText(/escolha o tema/i)
    await user.click(themeButton)
    const tecnologiaOption = await screen.findByText('Tecnologia')
    await user.click(tecnologiaOption)

    // Aguarda o estado ser atualizado e o botão ficar habilitado
    const generateButton = await screen.findByRole('button', { name: /gerar ideia/i })
    await waitFor(() => {
      expect(generateButton).not.toBeDisabled()
    })

    await createIdea(user)

    const favoriteButton = screen.getByRole('button', { name: /favoritar/i })
    await user.click(favoriteButton)
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')

    const favoritesCard = screen.getByText(/favoritas/i).closest('section')!
    expect(within(favoritesCard).getByText('1')).toBeInTheDocument()
  })

  it('o botão "Surpreenda-me" preenche tema/contexto e gera uma ideia', async () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.3) // tema -> Viagem
      .mockReturnValueOnce(0.0) // contexto -> primeiro item
      .mockReturnValue(0)

    mockIdeaService.generateSurpriseIdea.mockResolvedValue(mockSurpriseIdea)

    renderWithProviders(<GeneratorPage disableChatWidget />)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /surpreenda-me/i }))

    expect(await screen.findByText(/app que conecta viajantes com locais autênticos/i)).toBeInTheDocument()
    const textarea = await screen.findByPlaceholderText(/descreva o contexto/i) as HTMLTextAreaElement
    expect(textarea.value).not.toEqual('')
  })
})
