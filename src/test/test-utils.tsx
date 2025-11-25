import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeProvider'

type RenderOptions = {
  route?: string
}

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const { route = '/' } = options ?? {}
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </ThemeProvider>
  )
}
