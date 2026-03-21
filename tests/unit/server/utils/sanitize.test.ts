import { describe, it, expect } from 'vitest'
import { sanitizeText } from '~/server/utils/sanitize'

describe('sanitizeText', () => {
  it('strips HTML tags', () => {
    expect(sanitizeText('<script>alert("xss")</script>', 255)).toBe('alert("xss")')
  })

  it('strips nested tags', () => {
    expect(sanitizeText('<b>hello <i>world</i></b>', 255)).toBe('hello world')
  })

  it('enforces max length', () => {
    const long = 'a'.repeat(300)
    expect(sanitizeText(long, 255)).toHaveLength(255)
  })

  it('trims surrounding whitespace', () => {
    expect(sanitizeText('  hello  ', 255)).toBe('hello')
  })

  it('returns empty string for tag-only input', () => {
    expect(sanitizeText('<br/><hr>', 255)).toBe('')
  })

  it('handles mixed content', () => {
    expect(sanitizeText('Chicken <b>salad</b> with notes', 255)).toBe(
      'Chicken salad with notes'
    )
  })
})
