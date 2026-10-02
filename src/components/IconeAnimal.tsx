// Ícones dos animais do catálogo, no mesmo estilo dos ícones do app (Icone.tsx) e do site:
// traço fino arredondado, sem preenchimento, na cor de destaque do tema. Aprovados na prévia de 02/10/2026.
// Um ícone por tipo de animal; espécies parecidas usam o mesmo (ver o campo "icone" em data/animais.ts).
import React from 'react'
import type { ReactElement } from 'react'
import Svg, { Circle, Ellipse, Path } from 'react-native-svg'
import { cores } from '../theme/tema'

const desenhos = (cor: string) => ({
  peixe: (
    <>
      <Path d="M2.5 12c2.6-4.6 9.4-5.6 14 0-4.6 5.6-11.4 4.6-14 0z"/>
      <Path d="M16.5 12 21 8.5v7z"/>
      <Path d="M11 8.2c.8 1 .8 6.6 0 7.6"/>
      <Circle cx="6.6" cy="11.2" r=".7" fill={cor} stroke="none"/>
    </>
  ),
  tubarao: (
    <>
      <Path d="M2 13.5c4.5-3.5 11-4.5 16.5-1.5L22 9v8.5l-3.5-3c-5.5 2.6-12 2-16.5-1z"/>
      <Path d="M9 10.3 11 5l3.4 5.2"/>
      <Path d="M6 13.2v1.2M7.3 13v1.3"/>
      <Circle cx="4.6" cy="12.6" r=".6" fill={cor} stroke="none"/>
    </>
  ),
  raia: (
    <>
      <Path d="M12 6.5c-3.5 0-7.4 2.6-9.5 7 3.9-.4 7 .8 9.5 3.5 2.5-2.7 5.6-3.9 9.5-3.5-2.1-4.4-6-7-9.5-7z"/>
      <Path d="M12 17v5"/>
      <Path d="M10.4 6.8 10 5M13.6 6.8 14 5"/>
    </>
  ),
  moreia: (
    <>
      <Path d="M2.5 11c1.6-2.4 5-2.6 6.6-.3 1.6 2.4 3.4 4 5.8 2.6 2.3-1.4 3.8-3.6 6.6-2.4"/>
      <Path d="M2.5 11c.5 1.5 2.1 2.4 3.8 1.9 1.4 1.4 3.2 2.6 5 3 2.6.6 4.6-.8 6.2-2.4"/>
      <Circle cx="5" cy="10.3" r=".6" fill={cor} stroke="none"/>
    </>
  ),
  cavalo: (
    <>
      <Path d="M10 4.5c1.6-1.2 4-.8 4.6 1 .4 1.2-.3 2.2-1.3 2.6 1.6 1.4 2.3 3.7 1.7 6-.6 2.4-2.6 3.6-2.6 5.4 0 1.6 2.4 1.8 2.6.3.1-.9-.9-1.2-1.4-.6"/>
      <Path d="M10 4.5 6 6l4 .8"/>
      <Path d="M12.4 9.5c-1.5.8-2 2.5-1.5 4"/>
      <Circle cx="12" cy="5.4" r=".6" fill={cor} stroke="none"/>
    </>
  ),
  baleia: (
    <>
      <Path d="M2.5 13.5c0-3 3-4.5 7-4.5 3.5 0 6 1.4 7.3 3.6L19 9.5h3l-1.6 3.4c.1 3-2.6 5.6-7.4 5.6h-3.5c-4.4 0-7-2-7-5z"/>
      <Path d="M5.5 16h5"/>
      <Circle cx="6" cy="12.3" r=".6" fill={cor} stroke="none"/>
      <Path d="M8 6.5c0-1 .6-1.8 1.4-2M8 6.5c0-1-.6-1.8-1.4-2"/>
    </>
  ),
  golfinho: (
    <>
      <Path d="M3 15.5c2.6-5 8.6-8 14.6-6.2L21 8l-1 3.2c.2 3.3-2.1 5.6-5.5 6.2l.8 3-3-2.4c-3.9.4-7.4-.4-9.3-2.5z"/>
      <Path d="M10.7 8.6 12 5.2l2 3.8"/>
      <Path d="M3 15.5 1.5 15"/>
      <Circle cx="6.4" cy="13.5" r=".6" fill={cor} stroke="none"/>
    </>
  ),
  narval: (
    <>
      <Path d="M4.5 14c0-2.8 2.8-4.2 6.5-4.2 3.2 0 5.5 1.3 6.6 3.4L20 10.5h2.5l-1.4 3.1c.1 2.8-2.4 5-6.8 5H11c-4 0-6.5-1.8-6.5-4.6z"/>
      <Path d="M4.6 13.2 1 8.5"/>
      <Circle cx="7.2" cy="12.8" r=".6" fill={cor} stroke="none"/>
    </>
  ),
  foca: (
    <>
      <Path d="M3.5 18.5c.5-5.4 4.2-9.6 9.3-9.6 1.2 0 2-.8 2.8-1.9.8-1 2-1.6 3.3-1.4 1.6.2 2.6 1.6 2.4 3l-2.3.4c.2 4.8-1.8 9.5-7 9.5z"/>
      <Path d="M8.5 18.5 6 21M13 18.5l2 2.5"/>
      <Circle cx="18.3" cy="7.4" r=".6" fill={cor} stroke="none"/>
    </>
  ),
  polvo: (
    <>
      <Path d="M6.5 11.5a5.5 5.5 0 0 1 11 0v2.5"/>
      <Path d="M6.5 11.5v3c0 2.2-1.4 3.4-3 3.4M9.5 14v3.6c0 1.5-1 2.6-2.4 2.6M14.5 14v3.6c0 1.5 1 2.6 2.4 2.6M17.5 14v.5c0 2.2 1.4 3.4 3 3.4M12 14.5V20"/>
      <Circle cx="10" cy="10" r=".7" fill={cor} stroke="none"/>
      <Circle cx="14" cy="10" r=".7" fill={cor} stroke="none"/>
    </>
  ),
  lula: (
    <>
      <Path d="M12 2.5 8.5 7v6h7V7z"/>
      <Path d="M8.5 7 6 9.5l2.5.8M15.5 7 18 9.5l-2.5.8"/>
      <Path d="M9 13v4.5c0 1.5-.8 2.8-2 3.5M11 13v7.5M13 13v7.5M15 13v4.5c0 1.5.8 2.8 2 3.5"/>
    </>
  ),
  caranguejo: (
    <>
      <Ellipse cx="12" cy="14" rx="6" ry="4"/>
      <Path d="M7.5 11.5 5 8M16.5 11.5 19 8"/>
      <Path d="M5 8c-1.6-.2-2.6-1.5-2.4-3 .9.6 1.9.7 2.8.2C6 6.2 6 7.4 5 8zM19 8c1.6-.2 2.6-1.5 2.4-3-.9.6-1.9.7-2.8.2-.6 1-.6 2.2.4 2.8z"/>
      <Path d="M6.4 15.5 3 17.5M6.6 17.2 4 20M17.6 15.5l3.4 2M17.4 17.2 20 20"/>
      <Path d="M10.5 10.2V9M13.5 10.2V9"/>
    </>
  ),
  lagosta: (
    <>
      <Path d="M12 6.5c-1.6 0-2.6 1.2-2.6 2.8v4.5c0 1.5 1.1 2.7 2.6 2.7s2.6-1.2 2.6-2.7V9.3c0-1.6-1-2.8-2.6-2.8z"/>
      <Path d="M10.2 18.5h3.6M10.6 20.8h2.8"/>
      <Path d="M9.4 9 6.5 6.5c-1.4.2-2.5-.6-2.8-1.9 1 .3 1.8 0 2.4-.6.7.5 1 1.4.4 2.5M14.6 9l2.9-2.5c1.4.2 2.5-.6 2.8-1.9-1 .3-1.8 0-2.4-.6-.7.5-1 1.4-.4 2.5"/>
      <Path d="M11 6.5 9.5 2.5M13 6.5l1.5-4"/>
    </>
  ),
  camarao: (
    <>
      <Path d="M5 9c1-3 4.4-4.6 8-4 4.6.8 7.2 4.8 6.3 9-.7 3.4-3.6 5.5-6.6 5.3"/>
      <Path d="M5 9c2.6.1 4.6 1.8 5.4 4.2.8 2.4 0 4.6-1.8 5.6"/>
      <Path d="M8.6 18.8 10.2 21h3.3l-.8-1.7"/>
      <Path d="M5 9 2 7.5M5.6 8 3.4 5"/>
      <Path d="M9.5 7.6 11 9.4M13 6.5l.8 2.6M16.5 8l-.5 2.6"/>
    </>
  ),
  tartaruga: (
    <>
      <Ellipse cx="12" cy="13.5" rx="5" ry="6"/>
      <Circle cx="12" cy="5" r="1.8"/>
      <Path d="M12 9.5v8M9.2 11.8l2.8 1.6 2.8-1.6M9.6 16.4l2.4-1.4 2.4 1.4"/>
      <Path d="M7.6 10.5C5.8 9.6 4.4 8.6 3.6 7.2M16.4 10.5c1.8-.9 3.2-1.9 4-3.3M8.2 17.8 5.6 20.2M15.8 17.8l2.6 2.4"/>
    </>
  ),
  'agua-viva': (
    <>
      <Path d="M5 11a7 6 0 0 1 14 0z"/>
      <Path d="M5 11c1.2.8 2.3.8 3.5 0 1.2.8 2.3.8 3.5 0 1.2.8 2.3.8 3.5 0 1.2.8 2.3.8 3.5 0"/>
      <Path d="M8 12.5c-.8 1.6.8 2.8 0 4.4s.8 2.8 0 4.1M12 12.5c-.8 1.6.8 2.8 0 4.4s.8 2.8 0 4.1M16 12.5c-.8 1.6.8 2.8 0 4.4s.8 2.8 0 4.1"/>
    </>
  ),
  anemona: (
    <>
      <Path d="M8 21h8M9 21c0-3 .4-6 1-8M15 21c0-3-.4-6-1-8M9.5 13h5"/>
      <Path d="M10 13C8 11 5 11 4 8.5M10.6 13C10 10 8 7.5 8.5 4.5M12 13V3.5M13.4 13c.6-3 2.6-5.5 2.1-8.5M14 13c2-2 5-2 6-4.5"/>
    </>
  ),
  coral: (
    <>
      <Path d="M12 21V12M12 15l-4-3.5V7M12 12.5l4-3V5M8 9.5 5.5 7.5V4.5M16 7.5l2.5-2V3M8 7 9.5 4.5M16 9.5l2.5 1V13"/>
      <Path d="M8.5 21h7"/>
    </>
  ),
  estrela: (
    <>
      <Path d="M12 3.2 14.3 9l6.2.5-4.7 4 1.5 6.1L12 16.3 6.7 19.6l1.5-6.1-4.7-4L9.7 9z"/>
      <Circle cx="12" cy="11.8" r=".7" fill={cor} stroke="none"/>
    </>
  ),
  ourico: (
    <>
      <Circle cx="12" cy="13" r="4.5"/>
      <Path d="M12 8.5V3M12 17.5V22M7.5 13H2M16.5 13H22M8.8 9.8 5 6M15.2 9.8 19 6M8.8 16.2 5 20M15.2 16.2 19 20M10 8.9 8.6 4.2M14 8.9l1.4-4.7"/>
    </>
  ),
  pepino: (
    <>
      <Path d="M5 15.5c-1.4-2.3-.3-5.2 2.4-6.2l7.5-2.8c2.6-1 5.4.4 5.9 3 .5 2.4-1 4.6-3.4 5.3l-7.8 2.4c-1.8.6-3.6 0-4.6-1.7z"/>
      <Path d="M4.6 14.6 2.5 15.5M5 13 2.8 12.8"/>
      <Circle cx="10" cy="11.5" r=".6" fill={cor} stroke="none"/>
      <Circle cx="13.5" cy="10.5" r=".6" fill={cor} stroke="none"/>
      <Circle cx="16.5" cy="11" r=".6" fill={cor} stroke="none"/>
      <Circle cx="12" cy="13.6" r=".6" fill={cor} stroke="none"/>
    </>
  ),
  dugongo: (
    <>
      <Path d="M3 13c0-2.6 2.4-4.2 5.8-4.2h4.4c2.8 0 4.6 1.3 5.4 3.2L21.5 10v6l-3-2c-.9 2-3 3.2-5.4 3.2H8.8C5.3 17.2 3 15.6 3 13z"/>
      <Path d="M3 13c-.6.8-.6 1.8 0 2.4"/>
      <Path d="M9 17.2 7.8 19.5M12 17.2l1 2.3"/>
      <Circle cx="5.6" cy="11.6" r=".6" fill={cor} stroke="none"/>
    </>
  ),
}) satisfies Record<string, ReactElement>

export type IconeAnimalNome = keyof ReturnType<typeof desenhos>

interface Props {
  nome: IconeAnimalNome
  tamanho?: number
  cor?: string
}

/** Ícone de um animal marinho (decorativo: o nome do animal sempre aparece junto). */
const IconeAnimal = ({ nome, tamanho = 30, cor = cores.destaque }: Props) => (
  <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {desenhos(cor)[nome]}
  </Svg>
)

export default IconeAnimal
