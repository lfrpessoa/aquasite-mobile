import { useCallback, useEffect, useRef, useState } from 'react'
import { mensagemDeErro } from '../services/http'

export interface Carregamento<T> {
  dados: T | null
  carregando: boolean
  erro: string | null
  /** busca de novo; silencioso = sem mostrar o indicador (usado no "puxar para atualizar" e nas atualizações automáticas) */
  recarregar: (silencioso?: boolean) => Promise<void>
  definir: (atualizar: (atual: T | null) => T | null) => void
}

/**
 * Busca dados da API ao abrir a tela, guarda o erro para mostrar e permite recarregar.
 * `a cada` (ms) repete a busca sozinha, como as atualizações automáticas do site (mensagens, notificações).
 */
export function useCarregar<T>(buscar: () => Promise<T>, dependencias: unknown[] = [], aCada?: number): Carregamento<T> {
  const [dados, setDados] = useState<T | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const buscarRef = useRef(buscar)
  buscarRef.current = buscar
  const vivo = useRef(true)

  const recarregar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true)
    try {
      const r = await buscarRef.current()
      if (!vivo.current) return
      setDados(r)
      setErro(null)
    } catch (e) {
      if (vivo.current && !silencioso) setErro(mensagemDeErro(e))
    } finally {
      if (vivo.current && !silencioso) setCarregando(false)
    }
  }, [])

  useEffect(() => {
    vivo.current = true
    void recarregar()
    const id = aCada ? setInterval(() => { void recarregar(true) }, aCada) : undefined
    return () => {
      vivo.current = false
      if (id) clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- as dependências são passadas por quem usa
  }, dependencias)

  const definir = useCallback((atualizar: (atual: T | null) => T | null) => setDados(atual => atualizar(atual)), [])

  return { dados, carregando, erro, recarregar, definir }
}
