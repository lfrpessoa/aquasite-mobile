// Gerado a partir de aquasite-react/src/componentes/interface/Icon.jsx do site: os mesmos ícones, desenhados com react-native-svg.
import React from 'react'
import type { ReactElement } from 'react'
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg'
import { cores } from '../theme/tema'

const ICONES = {
  acessibilidade: (
    <>
      <Circle cx="12" cy="4.5" r="1.8" />
      <Path d="M5 8.5l7 1.5 7-1.5" />
      <Path d="M12 10v4.5" />
      <Path d="M9 21l3-6.5 3 6.5" />
    </>
  ),
  heart: <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
  message: <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
  trash: (
    <>
      <Polyline points="3 6 5 6 21 6" />
      <Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <Line x1="10" y1="11" x2="10" y2="17" />
      <Line x1="14" y1="11" x2="14" y2="17" />
    </>
  ),
  camera: (
    <>
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx="12" cy="13" r="4" />
    </>
  ),
  user: (
    <>
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </>
  ),
  users: (
    <>
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  bell: (
    <>
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </>
  ),
  mail: (
    <>
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <Polyline points="22,6 12,13 2,6" />
    </>
  ),
  flag: (
    <>
      <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <Line x1="4" y1="22" x2="4" y2="15" />
    </>
  ),
  pencil: <Path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  save: (
    <>
      <Path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <Polyline points="17 21 17 13 7 13 7 21" />
      <Polyline points="7 3 7 8 15 8" />
    </>
  ),
  x: (
    <>
      <Line x1="18" y1="6" x2="6" y2="18" />
      <Line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  check: <Polyline points="20 6 9 17 4 12" />,
  alert: (
    <>
      <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <Line x1="12" y1="9" x2="12" y2="13" />
      <Line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  menu: (
    <>
      <Line x1="3" y1="12" x2="21" y2="12" />
      <Line x1="3" y1="6" x2="21" y2="6" />
      <Line x1="3" y1="18" x2="21" y2="18" />
    </>
  ),
  'arrow-left': (
    <>
      <Line x1="19" y1="12" x2="5" y2="12" />
      <Polyline points="12 19 5 12 12 5" />
    </>
  ),
  'arrow-right': (
    <>
      <Line x1="5" y1="12" x2="19" y2="12" />
      <Polyline points="12 5 19 12 12 19" />
    </>
  ),
  'chevron-up': <Polyline points="18 15 12 9 6 15" />,
  'chevron-down': <Polyline points="6 9 12 15 18 9" />,
  file: (
    <>
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <Polyline points="14 2 14 8 20 8" />
      <Line x1="16" y1="13" x2="8" y2="13" />
      <Line x1="16" y1="17" x2="8" y2="17" />
    </>
  ),
  fish: (
    <>
      <Path d="M3 12c3-5 9-6 13-1.5" />
      <Path d="M3 12c3 5 9 6 13 1.5" />
      <Path d="M16 10.5L21 7v10l-5-3.5" />
      <Circle cx="8" cy="11" r="0.6" />
    </>
  ),
  waves: (
    <>
      <Path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <Path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <Path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </>
  ),
  thermometer: <Path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />,
  sun: (
    <>
      <Circle cx="12" cy="12" r="5" />
      <Line x1="12" y1="1" x2="12" y2="3" />
      <Line x1="12" y1="21" x2="12" y2="23" />
      <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <Line x1="1" y1="12" x2="3" y2="12" />
      <Line x1="21" y1="12" x2="23" y2="12" />
      <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </>
  ),
  moon: <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  cloud: <Path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />,
  'cloud-drizzle': (
    <>
      <Line x1="8" y1="19" x2="8" y2="21" />
      <Line x1="8" y1="13" x2="8" y2="15" />
      <Line x1="16" y1="19" x2="16" y2="21" />
      <Line x1="16" y1="13" x2="16" y2="15" />
      <Line x1="12" y1="21" x2="12" y2="23" />
      <Line x1="12" y1="15" x2="12" y2="17" />
      <Path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
    </>
  ),
  'cloud-rain': (
    <>
      <Line x1="16" y1="13" x2="16" y2="21" />
      <Line x1="8" y1="13" x2="8" y2="21" />
      <Line x1="12" y1="15" x2="12" y2="23" />
      <Path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
    </>
  ),
  'cloud-lightning': (
    <>
      <Path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" />
      <Polyline points="13 11 9 17 15 17 11 23" />
    </>
  ),
  wind: <Path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />,
  'map-pin': (
    <>
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <Circle cx="12" cy="10" r="3" />
    </>
  ),
  search: (
    <>
      <Circle cx="11" cy="11" r="8" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  navigation: <Polygon points="3 11 22 2 13 21 11 13 3 11" />,
  crosshair: (
    <>
      <Circle cx="12" cy="12" r="10" />
      <Line x1="22" y1="12" x2="18" y2="12" />
      <Line x1="6" y1="12" x2="2" y2="12" />
      <Line x1="12" y1="6" x2="12" y2="2" />
      <Line x1="12" y1="22" x2="12" y2="18" />
    </>
  ),
  sunrise: (
    <>
      <Path d="M17 18a5 5 0 0 0-10 0" />
      <Line x1="12" y1="2" x2="12" y2="9" />
      <Line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
      <Line x1="1" y1="18" x2="3" y2="18" />
      <Line x1="21" y1="18" x2="23" y2="18" />
      <Line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
      <Line x1="23" y1="22" x2="1" y2="22" />
      <Polyline points="8 6 12 2 16 6" />
    </>
  ),
  sunset: (
    <>
      <Path d="M17 18a5 5 0 0 0-10 0" />
      <Line x1="12" y1="9" x2="12" y2="2" />
      <Line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
      <Line x1="1" y1="18" x2="3" y2="18" />
      <Line x1="21" y1="18" x2="23" y2="18" />
      <Line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
      <Line x1="23" y1="22" x2="1" y2="22" />
      <Polyline points="16 5 12 9 8 5" />
    </>
  ),
  droplet: <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />,
  share: (
    <>
      <Circle cx="18" cy="5" r="3" />
      <Circle cx="6" cy="12" r="3" />
      <Circle cx="18" cy="19" r="3" />
      <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </>
  ),
  link: (
    <>
      <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  copy: (
    <>
      <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  globe: (
    <>
      <Circle cx="12" cy="12" r="10" />
      <Line x1="2" y1="12" x2="22" y2="12" />
      <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
  lock: (
    <>
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  layers: (
    <>
      <Polygon points="12 2 2 7 12 12 22 7 12 2" />
      <Polyline points="2 17 12 22 22 17" />
      <Polyline points="2 12 12 17 22 12" />
    </>
  ),
  // Storys, destaques e grade do perfil (iguais aos do site)
  plus: (
    <>
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  grid: (
    <>
      <Rect x="3" y="3" width="7" height="7" />
      <Rect x="14" y="3" width="7" height="7" />
      <Rect x="3" y="14" width="7" height="7" />
      <Rect x="14" y="14" width="7" height="7" />
    </>
  ),
  list: (
    <>
      <Line x1="8" y1="6" x2="21" y2="6" />
      <Line x1="8" y1="12" x2="21" y2="12" />
      <Line x1="8" y1="18" x2="21" y2="18" />
      <Circle cx="4" cy="6" r="1" />
      <Circle cx="4" cy="12" r="1" />
      <Circle cx="4" cy="18" r="1" />
    </>
  ),
  pin: <Path d="M16 3l5 5-3 1-4 4 1 5-2 2-4-5-5 5-1-1 5-5-5-4 2-2 5 1 4-4z" />,
  eye: (
    <>
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <Circle cx="12" cy="12" r="3" />
    </>
  ),
  image: (
    <>
      <Rect x="3" y="3" width="18" height="18" rx="2" />
      <Circle cx="8.5" cy="8.5" r="1.5" />
      <Polyline points="21 15 16 10 5 21" />
    </>
  ),
  bookmark: <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  settings: (
    <>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  tartaruga: (
    <>
      <Path d="M5 12a6 5 0 1 0 12 0a6 5 0 1 0-12 0" />
      <Path d="M17 11.5c1.5-1 3-1 4 .5-1 1.5-2.5 1.5-4 .5" />
      <Path d="M7 8 4.5 5.5M7 16l-2.5 2.5M14 8l1.5-2.5M14 16l1.5 2.5" />
    </>
  ),
  lampada: (
    <>
      <Path d="M9 18h6M10 21h4" />
      <Path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.3 1 2.1h5c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
    </>
  ),
  coral: (
    <>
      <Path d="M12 21v-7M12 14c0-3-3-3.5-3-6.5M12 14c0-2 3-2.5 3-5.5" />
      <Path d="M9 7.5V5M15 8.5V6M6 21h12" />
      <Path d="M9 11c-2 0-3-1.5-3-3.5M15 11.5c2 0 3-1.5 3-3.5" />
    </>
  ),
  estrela: <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
} satisfies Record<string, ReactElement>

export type NomeIcone = keyof typeof ICONES


interface Props {
  nome: NomeIcone
  tamanho?: number
  cor?: string
  espessura?: number
  preenchimento?: string
}

const Icone = ({ nome, tamanho = 18, cor = cores.texto, espessura = 2, preenchimento = 'none' }: Props) => (
  <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill={preenchimento} stroke={cor}
    strokeWidth={espessura} strokeLinecap="round" strokeLinejoin="round" accessible={false}>
    {ICONES[nome]}
  </Svg>
)

export default Icone
