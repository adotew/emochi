const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'

export function randomCode(len = 5): string {
  let code = ''
  for (let i = 0; i < len; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return code
}

export function normalizeCode(code: string): string {
  return code.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}