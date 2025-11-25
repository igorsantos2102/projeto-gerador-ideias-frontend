import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import AutoResizeTextarea from './AutoResizeTextarea'

function mockScrollHeight(value: number) {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get() {
      return value
    },
  })
}

describe('AutoResizeTextarea', () => {
  beforeEach(() => {
    mockScrollHeight(40)
  })

  it('limita a quantidade de caracteres quando maxChars é informado', async () => {
    const handleChange = vi.fn()
    renderWithProviders(<AutoResizeTextarea aria-label="textarea" maxChars={5} onChange={handleChange} />)

    await userEvent.type(screen.getByLabelText('textarea'), '123456789')

    expect(screen.getByLabelText('textarea')).toHaveValue('12345')
    expect(handleChange).toHaveBeenCalled()
  })

  it('ajusta a altura automaticamente', async () => {
    const { rerender } = renderWithProviders(<AutoResizeTextarea aria-label="textarea" />)
    const textarea = screen.getByLabelText('textarea') as HTMLTextAreaElement

    const setHeight = vi.spyOn(textarea.style, 'height', 'set')

    await userEvent.type(textarea, 'hello')

    expect(setHeight).toHaveBeenNthCalledWith(1, 'auto')
    expect(setHeight).toHaveBeenNthCalledWith(2, '40px')

    rerender(<AutoResizeTextarea aria-label="textarea" />)
  })
})
