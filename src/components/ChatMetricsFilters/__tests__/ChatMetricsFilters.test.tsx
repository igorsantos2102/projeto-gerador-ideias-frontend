import { describe, it, vi, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatMetricsFilters from '../ChatMetricsFilters'

const createProps = () => ({
  date: '2025-01-01',
  onDateChange: vi.fn(),
  chatFilter: 'ALL' as const,
  onChatFilterChange: vi.fn(),
  compare: false,
  onToggleCompare: vi.fn(),
  darkMode: false,
})

describe('ChatMetricsFilters', () => {
  it('renderiza controles básicos e alterna filtros', async () => {
    const props = createProps()
    render(<ChatMetricsFilters {...props} />)

    const dateInput = screen.getByLabelText(/data/i)
    expect(dateInput).toHaveValue('2025-01-01')

    const livreButton = screen.getByRole('button', { name: /livres/i })
    await userEvent.click(livreButton)
    expect(props.onChatFilterChange).toHaveBeenCalledWith('FREE')
  })

  it('mantém o botão de comparação invisível quando o filtro não é ALL', async () => {
    const props = createProps()
    render(
      <ChatMetricsFilters
        {...props}
        chatFilter="FREE"
        compare={false}
      />
    )

    const compareButton = screen.getByLabelText(/alternar modo de comparação/i)
    expect(compareButton).toHaveAttribute('aria-hidden', 'true')
    expect(compareButton).toBeDisabled()
    await userEvent.click(compareButton)
    expect(props.onToggleCompare).not.toHaveBeenCalled()
  })

  it('exibe input de busca quando onQueryChange está presente', async () => {
    const props = createProps()
    const onQueryChange = vi.fn()
    render(
      <ChatMetricsFilters
        {...props}
        onQueryChange={onQueryChange}
        compare
        darkMode
        chatFilter="ALL"
      />
    )

    const searchInput = screen.getByLabelText(/buscar por usu/i)
    expect(searchInput).toHaveValue('')

    fireEvent.change(searchInput, { target: { value: 'novo' } })
    expect(onQueryChange).toHaveBeenLastCalledWith('novo')
  })
})
