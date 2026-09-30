import { StyleSheet } from 'react-native'
import { cores } from './cores'

/** Cores em uso (paleta escolhida em Aparência: escuro, claro ou alto contraste). */
export { cores }

export const espaco = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const

export const raio = { sm: 8, md: 12, lg: 16, pilula: 999 } as const

export const fonte = { pequena: 12, normal: 15, media: 17, grande: 20, titulo: 26 } as const

/** Estilos repetidos em várias telas. */
export const base = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  cartao: {
    backgroundColor: cores.painel,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
  },
  tituloSecao: {
    color: cores.destaque,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: espaco.sm,
  },
  texto: { color: cores.texto, fontSize: fonte.normal, lineHeight: 22 },
  textoSuave: { color: cores.textoApagado, fontSize: 13 },
  linha: { flexDirection: 'row', alignItems: 'center' },
})
