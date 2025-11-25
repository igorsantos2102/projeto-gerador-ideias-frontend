import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import FilterHistory, { type FilterHistoryOption } from '@/components/FilterHistory'
import { renderWithProviders } from '@/test/test-utils'

describe('FilterHistory', () => {
  it('renderiza labels e título básicos', () => {
    renderWithProviders(<FilterHistory />)
    expect(screen.getByText('Filtros')).toBeInTheDocument()
    expect(screen.getByLabelText('Categoria')).toBeInTheDocument()
    expect(screen.getByLabelText('Data Início')).toBeInTheDocument()
    expect(screen.getByLabelText('Data Fim')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /limpar filtros/i })).toBeInTheDocument()
  })

  it('chama onChange ao alterar categoria (controlado)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const categories: FilterHistoryOption[] = [
      { label: 'Todas', value: '' },
      { label: 'Tecnologia', value: '1' },
    ]
    renderWithProviders(<FilterHistory value={{ category: '', startDate: '', endDate: '' }} onChange={onChange} categories={categories} />)
    const select = screen.getByLabelText('Categoria') as HTMLSelectElement
    await user.selectOptions(select, '1')
    expect(onChange).toHaveBeenCalled()
    const call = onChange.mock.calls.at(-1)?.[0]
    expect(call).toMatchObject({ category: '1' })
  })

  it('altera datas (controlado) e a UI reflete os valores', async () => {
    function Harness() {
      const [value, setValue] = useState({ category: '', startDate: '', endDate: '' })
      return <FilterHistory value={value} onChange={(next) => setValue(prev => ({ ...prev, ...next }))} />
    }
    renderWithProviders(<Harness />)
    const start = screen.getByLabelText('Data Início') as HTMLInputElement
    const end = screen.getByLabelText('Data Fim') as HTMLInputElement
    fireEvent.change(start, { target: { value: '2025-03-20' } })
    expect(start).toHaveValue('2025-03-20')
    fireEvent.change(end, { target: { value: '2025-03-21' } })
    expect(end).toHaveValue('2025-03-21')
  })

  it('limpa filtros ao clicar no botão', async () => {
    const onChange = vi.fn()
    const onClear = vi.fn()
    const categories: FilterHistoryOption[] = [
      { label: 'Todas', value: '' },
      { label: 'Tecnologia', value: 'tecnologia' },
    ]
    renderWithProviders(
      <FilterHistory
        value={{ category: 'tecnologia', startDate: '2025-03-20', endDate: '2025-03-21' }}
        onChange={onChange}
        onClear={onClear}
        categories={categories}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /limpar filtros/i }))
    expect(onClear).toHaveBeenCalled()
    const last = onChange.mock.calls.at(-1)?.[0]
    expect(last).toEqual({ category: '', startDate: '', endDate: '' })
  })

  it('aplica classes do dark mode quando darkMode=true', () => {
    const { container } = renderWithProviders(<FilterHistory darkMode />)
    const panel = container.querySelector('.fh-container')
    expect(panel).toBeInTheDocument()
    // Em dark mode, um dos modifiers deve estar presente
    expect(panel?.className).toContain('fh-container-dark')
  })
})
