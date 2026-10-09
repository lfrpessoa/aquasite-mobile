// Alertas automáticos de risco marítimo — mesmas regras do site (componentes/praia/riscoMaritimo.js).
// São uma orientação e não substituem os avisos oficiais da Marinha e da Defesa Civil.
import type { NomeIcone } from '../components/Icone'
import type { ClimaAtual, MarAtual } from '../services/clima'
import { numero } from './formatar'

interface AlertaMar {
  nivel: 'perigo' | 'atencao'
  icone: NomeIcone
  texto: string
}

interface Entrada {
  clima: Partial<ClimaAtual> | null | undefined
  mar: Partial<MarAtual> | null | undefined
  dias?: { onda: number | null | undefined; rotulo: string }[]
}

const TEMPESTADE = [95, 96, 99]

export function riscosMaritimos({ clima, mar, dias = [] }: Entrada): AlertaMar[] {
  const alertas: AlertaMar[] = []
  const add = (nivel: AlertaMar['nivel'], icone: NomeIcone, texto: string) => alertas.push({ nivel, icone, texto })

  if (clima?.weather_code != null && TEMPESTADE.includes(clima.weather_code))
    add('perigo', 'cloud-lightning', 'Trovoadas agora: saia da água e da faixa de areia.')

  const onda = mar?.wave_height
  if (onda != null) {
    if (onda >= 2.5) add('perigo', 'waves', `Mar muito agitado (ondas de ${numero(onda)} m). Evite entrar na água.`)
    else if (onda >= 1.5) add('atencao', 'waves', `Ondas de ${numero(onda)} m: cuidado ao nadar e fique perto do salva-vidas.`)
  }

  const vento = clima?.wind_speed_10m ?? 0
  const rajada = clima?.wind_gusts_10m ?? 0
  // o texto cita o que disparou o alerta: o vento constante ou as rajadas
  const ventoTxt = (limite: number) => vento >= limite
    ? `Vento de ${numero(vento, 0)} km/h`
    : `Rajadas de vento de até ${numero(rajada, 0)} km/h`
  if (vento >= 50 || rajada >= 65)
    add('perigo', 'wind', `${ventoTxt(50)}. Evite barcos, pranchas e caiaques.`)
  else if (vento >= 35 || rajada >= 50)
    add('atencao', 'wind', `${ventoTxt(35)}: atenção com guarda-sóis e esportes na água.`)

  const correnteza = mar?.ocean_current_velocity
  if (correnteza != null && correnteza >= 3)
    add('atencao', 'navigation', `Correnteza de ${numero(correnteza)} km/h: não nade para longe da arrebentação.`)

  const ressaca = dias.find(d => d.onda != null && d.onda >= 2.5)
  if (ressaca && !(onda != null && onda >= 2.5))
    add('atencao', 'waves', `Ressaca prevista para ${ressaca.rotulo}: ondas de até ${numero(ressaca.onda ?? 0)} m.`)

  return alertas.sort((a, b) => (a.nivel === b.nivel ? 0 : a.nivel === 'perigo' ? -1 : 1))
}
