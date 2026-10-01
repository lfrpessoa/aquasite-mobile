import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ErroApi, mensagemDeErro } from '../services/http'

export interface Carregamento<T> {
  dados: T | null
  carregando: boolean
  erro: string | null
  /** status HTTP do último erro (ex.: 404 = não existe mais); 0 = sem conexão; null = sem erro */
  erroStatus: number | null
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
  const [erroStatus, setErroStatus] = useState<number | null>(null)
  const buscarRef = useRef(buscar)
  // guarda a função mais recente sem mexer em ref durante a renderização
  useLayoutEffect(() => { buscarRef.current = buscar })
  const vivo = useRef(true)

  /** Busca na API. Todo setState vem depois da resposta, então pode ser chamado de dentro do efeito. */
  const buscarAgora = useCallback(async (mostrarErro: boolean) => {
    try {
      const r = await buscarRef.current()
      if (!vivo.current) return
      setDados(r)
      setErro(null)
      setErroStatus(null)
    } catch (e) {
      if (vivo.current && mostrarErro) {
        setErro(mensagemDeErro(e))
        setErroStatus(e instanceof ErroApi ? e.status : null)
      }
    } finally {
      if (vivo.current) setCarregando(false)
    }
  }, [])

  // chamado pela tela (puxar para atualizar, botão de tentar de novo): aí pode mostrar o indicador
  const recarregar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true)
    await buscarAgora(!silencioso)
  }, [buscarAgora])

  useEffect(() => {
    vivo.current = true
    void buscarAgora(true)
    const id = aCada ? setInterval(() => { void buscarAgora(false) }, aCada) : undefined
    return () => {
      vivo.current = false
      if (id) clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- as dependências são passadas por quem usa
  }, dependencias)

  const definir = useCallback((atualizar: (atual: T | null) => T | null) => setDados(atual => atualizar(atual)), [])

  return { dados, carregando, erro, erroStatus, recarregar, definir }
}
