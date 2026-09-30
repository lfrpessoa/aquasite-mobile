import React, { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { usePresenca } from '../hooks/usePresenca'
import type { Presenca } from '../hooks/usePresenca'

const PresencaContext = createContext<Presenca>({ naoLidas: 0, zerarNaoLidas: () => undefined })

/** Compartilha o contador de notificações não lidas (sino do feed) com todas as telas. */
export function PresencaProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth()
  const presenca = usePresenca(usuario?.username ?? null)
  return <PresencaContext.Provider value={presenca}>{children}</PresencaContext.Provider>
}

export const usePresencaApp = (): Presenca => useContext(PresencaContext)
