/** Mesma regra da API ao trocar o nome: 3 a 30 caracteres, só letras, números, ponto, hífen e sublinhado. */
const NOME_VALIDO = /^[A-Za-z0-9._-]{3,30}$/

/** Mensagem do problema com o nome de usuário, ou null se ele estiver ok. */
export function erroNoNome(nome: string): string | null {
  const n = nome.trim()
  if (n.length < 3 || n.length > 30) return 'O nome precisa ter de 3 a 30 caracteres.'
  if (!NOME_VALIDO.test(n)) return 'Use só letras sem acento, números, ponto, hífen ou sublinhado (sem espaços nem @).'
  return null
}
