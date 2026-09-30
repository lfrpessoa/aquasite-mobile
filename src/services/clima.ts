/**
 * Serviços públicos de mapas e clima usados pela página Mapa do site (mesmas fontes, mesmas URLs):
 *  - Open-Meteo: tempo, mar e maré;
 *  - Nominatim (OpenStreetMap): busca de praias pelo nome e nome de um ponto clicado;
 *  - OSRM: distância e tempo de carro até a praia.
 * Nada disso passa pelo backend do AquaSite (no site também não passa).
 */
import type { Local } from '../utils/praias'

export interface ClimaAtual {
  time: string
  temperature_2m: number
  apparent_temperature: number
  weather_code: number
  wind_speed_10m: number
  wind_direction_10m: number
  wind_gusts_10m?: number
  uv_index: number
  relative_humidity_2m: number
}

export interface ClimaDiario {
  time: string[]
  sunrise: string[]
  sunset: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  weather_code: number[]
  uv_index_max?: number[]
  precipitation_probability_max?: (number | null)[]
}

export interface MarAtual {
  time: string
  wave_height: number | null
  wave_direction: number | null
  wave_period: number | null
  swell_wave_height: number | null
  sea_surface_temperature: number | null
  ocean_current_velocity: number | null
}

export interface Condicoes {
  clima: { current: ClimaAtual; daily: ClimaDiario } | null
  mar: {
    current: MarAtual
    hourly?: { time: string[]; sea_level_height_msl: (number | null)[] }
    daily?: { time: string[]; wave_height_max: (number | null)[] }
  } | null
}

export interface Rota {
  km: number
  min: number
}

const NOMINATIM = 'https://nominatim.openstreetmap.org'
// O Nominatim pede que cada aplicativo se identifique
const CABECALHO_OSM = { 'Accept-Language': 'pt-BR', 'User-Agent': 'AquaSite-Mobile/1.0 (TCC FIEB)' }

async function json<T>(url: string, headers?: Record<string, string>): Promise<T> {
  const r = await fetch(url, { headers })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return (await r.json()) as T
}

/** Tempo e mar de um ponto. Se só um dos dois falhar, devolve o outro. */
export async function buscarCondicoes(lat: number, lon: number): Promise<Condicoes> {
  const q = `latitude=${lat}&longitude=${lon}&timezone=auto`
  const [clima, mar] = await Promise.allSettled([
    json<NonNullable<Condicoes['clima']>>(
      `https://api.open-meteo.com/v1/forecast?${q}&forecast_days=4` +
      '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,relative_humidity_2m' +
      '&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,weather_code,uv_index_max,precipitation_probability_max'),
    json<NonNullable<Condicoes['mar']>>(
      `https://marine-api.open-meteo.com/v1/marine?${q}&forecast_days=4` +
      '&current=wave_height,wave_direction,wave_period,swell_wave_height,sea_surface_temperature,ocean_current_velocity' +
      '&hourly=sea_level_height_msl&daily=wave_height_max'),
  ])
  if (clima.status === 'rejected' && mar.status === 'rejected') throw new Error('Sem dados de tempo agora.')
  return {
    clima: clima.status === 'fulfilled' ? clima.value : null,
    mar: mar.status === 'fulfilled' && mar.value.current?.wave_height != null ? mar.value : null,
  }
}

interface EnderecoOsm {
  city?: string; town?: string; village?: string; municipality?: string; county?: string
  state?: string; country?: string; road?: string
  'ISO3166-2-lvl4'?: string
}

function localDoEndereco(a: EnderecoOsm = {}): { cidade: string; uf: string } {
  const cidade = a.city || a.town || a.village || a.municipality || a.county || ''
  const iso = a['ISO3166-2-lvl4'] || ''
  const uf = iso.startsWith('BR-') ? iso.slice(3) : (a.state || a.country || '')
  return { cidade, uf }
}

interface ResultadoOsm {
  name?: string
  display_name: string
  lat: string
  lon: string
  type?: string
  address?: EnderecoOsm
}

/** Busca lugares do Brasil pelo nome (como a barra "Pesquise praias do Brasil" do site). */
export async function buscarLugares(termo: string): Promise<(Local & { praia: boolean })[]> {
  const d = await json<ResultadoOsm[]>(
    `${NOMINATIM}/search?q=${encodeURIComponent(termo)}&format=jsonv2&addressdetails=1&limit=6&countrycodes=br`,
    CABECALHO_OSM)
  return d.map(x => {
    const { cidade, uf } = localDoEndereco(x.address)
    return {
      nome: x.name || x.display_name.split(',')[0], cidade, uf,
      lat: Number(x.lat), lon: Number(x.lon), praia: x.type === 'beach',
    }
  })
}

/** Nome de um ponto tocado no mapa. */
export async function nomeDoPonto(lat: number, lon: number): Promise<Local> {
  const d = await json<ResultadoOsm>(
    `${NOMINATIM}/reverse?lat=${lat}&lon=${lon}&format=jsonv2&zoom=16&addressdetails=1`, CABECALHO_OSM)
  const { cidade, uf } = localDoEndereco(d.address)
  return { nome: d.name || d.address?.road || cidade || 'Ponto no mapa', cidade, uf, lat, lon }
}

interface RespostaOsrm {
  code: string
  routes?: { distance: number; duration: number }[]
  waypoints?: { distance: number }[]
}

/** Distância de carro; null se não há estrada até lá (ex.: ilha). */
export async function rotaDeCarro(de: { lat: number; lon: number }, para: { lat: number; lon: number }): Promise<Rota | null> {
  const d = await json<RespostaOsrm>(
    `https://router.project-osrm.org/route/v1/driving/${de.lon},${de.lat};${para.lon},${para.lat}?overview=false`)
  const pertoDaEstrada = (d.waypoints?.[1]?.distance ?? Infinity) <= 3000
  const r = d.code === 'Ok' && pertoDaEstrada ? d.routes?.[0] : undefined
  return r ? { km: r.distance / 1000, min: r.duration / 60 } : null
}
