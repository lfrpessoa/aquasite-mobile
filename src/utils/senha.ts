// Guia visual da força da senha (a regra de verdade é conferida pelo servidor: 8 a 16 caracteres,
// pelo menos uma letra e um número ou símbolo — RN02).
export interface ForcaSenha {
  tamanhoOk: boolean
  temLetra: boolean
  temNumeroOuSimbolo: boolean
  forte: boolean
  rotulo: string
  cor: string
  fracao: number
}

export function forcaDaSenha(senha: string): ForcaSenha {
  const tamanhoOk = senha.length >= 8 && senha.length <= 16
  const temLetra = /[a-zA-Z]/.test(senha)
  const temNumeroOuSimbolo = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha)
  const pontos = [tamanhoOk, temLetra, temNumeroOuSimbolo].filter(Boolean).length
  const forte = pontos === 3
  return {
    tamanhoOk, temLetra, temNumeroOuSimbolo, forte,
    rotulo: forte ? 'Senha forte' : pontos === 2 ? 'Senha média' : 'Senha fraca',
    cor: forte ? '#4ecdc4' : pontos === 2 ? '#ffa726' : '#ff6b6b',
    fracao: pontos / 3,
  }
}
