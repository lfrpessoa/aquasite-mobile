import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { contas } from '../services/api'
import { aoSessaoExpirar, definirToken } from '../services/http'
import { apagar, gravar, ler } from '../services/armazenamento'
import { apagarCache } from '../services/cache'
import { removerAparelho } from '../services/push'
import type { RespostaLogin, Sessao, UsuarioSessao } from '../types/api'

/**
 * Sessão do app. Usa o MESMO login da API do site (POST /api/users/login e /register),
 * que devolve um token JWT; o token vai em todas as chamadas seguintes.
 */
const CHAVE = 'aquasite.sessao'

export interface ResultadoEntrada {
  ok: boolean
  erro?: string
}

interface ValorAuth {
  carregando: boolean
  sessao: Sessao | null
  usuario: UsuarioSessao | null
  ehAdmin: boolean
  /** true quando a última sessão terminou porque o token expirou */
  sessaoExpirada: boolean
  entrar: (login: string, senha: string) => Promise<ResultadoEntrada>
  cadastrar: (dados: { username: string; email: string; password: string; bio?: string; avatar?: string | null }) => Promise<ResultadoEntrada>
  sair: () => Promise<void>
  /** depois de trocar o nome de usuário a API devolve um token novo */
  atualizarConta: (username: string, token?: string) => Promise<void>
}

const AuthContext = createContext<ValorAuth | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [sessaoExpirada, setSessaoExpirada] = useState(false)

  const guardar = useCallback(async (nova: Sessao | null) => {
    definirToken(nova?.token ?? null)
    setSessao(nova)
    if (nova) await gravar(CHAVE, JSON.stringify(nova))
    else await apagar(CHAVE)
  }, [])

  // abre o app já logado, se houver sessão salva no aparelho
  useEffect(() => {
    ler(CHAVE)
      .then(texto => {
        if (!texto) return
        const salva = JSON.parse(texto) as Sessao
        definirToken(salva.token)
        setSessao(salva)
      })
      .catch(() => { /* sessão corrompida: começa deslogado */ })
      .finally(() => setCarregando(false))
  }, [])

  // a API respondeu 401: token vencido (dura 24 h) → volta para o login com aviso
  useEffect(() => {
    aoSessaoExpirar(() => {
      setSessaoExpirada(true)
      void guardar(null)
    })
    return () => aoSessaoExpirar(null)
  }, [guardar])

  const aplicar = useCallback(async (r: RespostaLogin): Promise<ResultadoEntrada> => {
    if (!r.success || !r.token || !r.user) return { ok: false, erro: r.error ?? 'Não foi possível entrar.' }
    setSessaoExpirada(false)
    await guardar({ token: r.token, usuario: r.user })
    return { ok: true }
  }, [guardar])

  const entrar = useCallback(async (login: string, senha: string) =>
    aplicar(await contas.entrar(login.trim(), senha)), [aplicar])

  const cadastrar = useCallback<ValorAuth['cadastrar']>(async (dados) =>
    aplicar(await contas.cadastrar(dados)), [aplicar])

  const sair = useCallback(async () => {
    if (sessao) await apagarCache(sessao.usuario.username)
    await removerAparelho() // antes de apagar o token: a API precisa saber de quem é o aparelho
    await guardar(null)
  }, [guardar, sessao])

  const atualizarConta = useCallback(async (username: string, token?: string) => {
    if (!sessao) return
    await guardar({ token: token ?? sessao.token, usuario: { ...sessao.usuario, username } })
  }, [guardar, sessao])

  const valor = useMemo<ValorAuth>(() => ({
    carregando, sessao, usuario: sessao?.usuario ?? null, ehAdmin: sessao?.usuario.role === 'ADMIN',
    sessaoExpirada, entrar, cadastrar, sair, atualizarConta,
  }), [carregando, sessao, sessaoExpirada, entrar, cadastrar, sair, atualizarConta])

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth(): ValorAuth {
  const v = useContext(AuthContext)
  if (!v) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return v
}

/** Para telas que só existem logado: o nome da conta, sem precisar checar null toda hora. */
export function useEu(): UsuarioSessao {
  const { usuario } = useAuth()
  if (!usuario) throw new Error('Tela usada sem login')
  return usuario
}
