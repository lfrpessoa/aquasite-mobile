// Mesmas regras de exibição do Mapa e da "Praia mais próxima" do site (servicos/praiaInfo.js e dados/praias.js).
import type { CategoriaAviso } from '../types/api'
import type { NomeIcone } from '../components/Icone'

export interface Local {
  nome: string
  cidade: string
  uf: string
  lat: number
  lon: number
}

/** Praias em destaque (a mesma lista do site). */
export const PRAIAS: Local[] = [
  { nome: 'Copacabana', cidade: 'Rio de Janeiro', uf: 'RJ', lat: -22.9711, lon: -43.1822 },
  { nome: 'Ipanema', cidade: 'Rio de Janeiro', uf: 'RJ', lat: -22.9868, lon: -43.2044 },
  { nome: 'Praia Grande', cidade: 'Praia Grande', uf: 'SP', lat: -24.0084, lon: -46.4121 },
  { nome: 'Praia de Santos', cidade: 'Santos', uf: 'SP', lat: -23.9718, lon: -46.3298 },
  { nome: 'Guarujá', cidade: 'Guarujá', uf: 'SP', lat: -23.9931, lon: -46.2564 },
  { nome: 'Praia do Rosa', cidade: 'Imbituba', uf: 'SC', lat: -28.1264, lon: -48.6386 },
  { nome: 'Balneário Camboriú', cidade: 'Balneário Camboriú', uf: 'SC', lat: -26.9906, lon: -48.6349 },
  { nome: 'Praia de Jurerê', cidade: 'Florianópolis', uf: 'SC', lat: -27.4372, lon: -48.4931 },
  { nome: 'Praia do Cassino', cidade: 'Rio Grande', uf: 'RS', lat: -32.1978, lon: -52.1508 },
  { nome: 'Torres', cidade: 'Torres', uf: 'RS', lat: -29.3350, lon: -49.7269 },
  { nome: 'Porto de Galinhas', cidade: 'Ipojuca', uf: 'PE', lat: -8.5106, lon: -35.0031 },
  { nome: 'Boa Viagem', cidade: 'Recife', uf: 'PE', lat: -8.1195, lon: -34.9018 },
  { nome: 'Porto da Barra', cidade: 'Salvador', uf: 'BA', lat: -13.0100, lon: -38.5306 },
  { nome: 'Praia do Forte', cidade: 'Mata de São João', uf: 'BA', lat: -12.5794, lon: -38.0031 },
  { nome: 'Morro de São Paulo', cidade: 'Cairu', uf: 'BA', lat: -13.3808, lon: -38.9139 },
  { nome: 'Praia do Futuro', cidade: 'Fortaleza', uf: 'CE', lat: -3.7361, lon: -38.4708 },
  { nome: 'Jericoacoara', cidade: 'Jijoca de Jericoacoara', uf: 'CE', lat: -2.7975, lon: -40.5137 },
  { nome: 'Ponta Negra', cidade: 'Natal', uf: 'RN', lat: -5.8767, lon: -35.1631 },
  { nome: 'Praia do Francês', cidade: 'Marechal Deodoro', uf: 'AL', lat: -9.7508, lon: -35.8397 },
  { nome: 'Praia de Camburi', cidade: 'Vitória', uf: 'ES', lat: -20.2761, lon: -40.2717 },
  { nome: 'Praia de Ubatuba', cidade: 'Ubatuba', uf: 'SP', lat: -23.4339, lon: -45.0839 },
  { nome: 'Praia de Maragogi', cidade: 'Maragogi', uf: 'AL', lat: -9.0119, lon: -35.2222 },
  { nome: 'Barra Grande', cidade: 'Maraú', uf: 'BA', lat: -14.2725, lon: -39.0125 },
]

export interface InfoCategoria {
  valor: CategoriaAviso
  label: string
  icone: NomeIcone
  cor: string
}

export const CATEGORIAS: InfoCategoria[] = [
  { valor: 'poluicao', label: 'Poluição', icone: 'trash', cor: '#e8a33d' },
  { valor: 'perigo', label: 'Perigo / correnteza', icone: 'alert', cor: '#e15656' },
  { valor: 'fauna', label: 'Avistamento de fauna', icone: 'fish', cor: '#3dbf7a' },
  { valor: 'lotacao', label: 'Lotação', icone: 'users', cor: '#3d9be8' },
  { valor: 'outro', label: 'Outro', icone: 'file', cor: '#8a8a9e' },
]

export const categoriaInfo = (valor: string): InfoCategoria =>
  CATEGORIAS.find(c => c.valor === valor) ?? CATEGORIAS[4]

/** Distância em km entre duas coordenadas (fórmula de Haversine). */
export function distanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function praiaMaisProxima(lat: number, lon: number): { praia: Local; km: number } {
  let melhor = PRAIAS[0]
  let menor = Infinity
  for (const p of PRAIAS) {
    const d = distanciaKm(lat, lon, p.lat, p.lon)
    if (d < menor) { menor = d; melhor = p }
  }
  return { praia: melhor, km: menor }
}

export interface Condicao {
  texto: string
  icone: NomeIcone
}

/** Códigos de tempo (WMO) simplificados para pt-BR. */
export const condicaoPorCodigo = (code: number | undefined): Condicao => {
  if (code === 0) return { texto: 'Céu limpo', icone: 'sun' }
  if (code != null && [1, 2, 3].includes(code)) return { texto: 'Parcialmente nublado', icone: 'cloud' }
  if (code != null && [45, 48].includes(code)) return { texto: 'Neblina', icone: 'wind' }
  if (code != null && [51, 53, 55, 56, 57].includes(code)) return { texto: 'Garoa', icone: 'cloud-drizzle' }
  if (code != null && [61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { texto: 'Chuva', icone: 'cloud-rain' }
  if (code != null && [95, 96, 99].includes(code)) return { texto: 'Tempestade', icone: 'cloud-lightning' }
  return { texto: 'Condições variáveis', icone: 'waves' }
}

/** Direção em graus → ponto cardeal (de onde vem o vento/onda). */
export const pontoCardeal = (graus: number | null | undefined): string =>
  graus == null ? '' : ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'][Math.round(graus / 45) % 8]

/** Índice UV segundo a escala da OMS. */
export const nivelUV = (uv: number | null | undefined): { texto: string; cor: string } | null => {
  if (uv == null) return null
  if (uv < 3) return { texto: 'Baixo', cor: '#3dbf7a' }
  if (uv < 6) return { texto: 'Moderado', cor: '#e8c13d' }
  if (uv < 8) return { texto: 'Alto', cor: '#e8a33d' }
  if (uv < 11) return { texto: 'Muito alto', cor: '#e15656' }
  return { texto: 'Extremo', cor: '#b04ad6' }
}

export const estadoDoMar = (altura: number | null | undefined): string | null => {
  if (altura == null) return null
  if (altura < 0.5) return 'Mar calmo'
  if (altura < 1.25) return 'Ondas pequenas'
  if (altura < 2.5) return 'Mar moderado'
  return 'Mar agitado, cuidado'
}
