// Catálogo "Animais Marinhos": as 35 espécies do app mobile original do grupo (conteúdo fixo, como Curiosidades).
// Correção em relação ao app antigo: a raia-manta é um peixe cartilaginoso, não um molusco.

export type GrupoAnimal = 'Peixe' | 'Mamífero' | 'Molusco' | 'Crustáceo' | 'Réptil' | 'Cnidário' | 'Equinodermo'

export interface Animal {
  nome: string
  grupo: GrupoAnimal
  emoji: string
  /** faixa de profundidade em que costuma viver */
  profundidade: string
  curiosidade: string
}

export const GRUPOS: GrupoAnimal[] = ['Peixe', 'Mamífero', 'Molusco', 'Crustáceo', 'Réptil', 'Cnidário', 'Equinodermo']

export const ANIMAIS: Animal[] = [
  { nome: 'Peixe-Palhaço', grupo: 'Peixe', emoji: '🐠', profundidade: '1–15 m', curiosidade: 'Vive em simbiose com anêmonas. Imune ao veneno delas.' },
  { nome: 'Peixe-Anjo', grupo: 'Peixe', emoji: '🐡', profundidade: '1–100 m', curiosidade: 'Muda de cor e até de sexo conforme cresce.' },
  { nome: 'Peixe-Cirurgião', grupo: 'Peixe', emoji: '🐟', profundidade: '3–40 m', curiosidade: 'Possui uma espinha retrátil e afiada na cauda usada como defesa.' },
  { nome: 'Peixe-Borboleta', grupo: 'Peixe', emoji: '🐠', profundidade: '1–30 m', curiosidade: 'A mancha escura próxima à cauda confunde os predadores.' },
  { nome: 'Peixe-Papagaio', grupo: 'Peixe', emoji: '🐠', profundidade: '1–25 m', curiosidade: 'Mastiga corais e expele areia branca — responsável por praias inteiras.' },
  { nome: 'Tubarão-Branco', grupo: 'Peixe', emoji: '🦈', profundidade: '0–1.200 m', curiosidade: 'Pode ter até 50.000 dentes ao longo da vida, pois se renovam constantemente.' },
  { nome: 'Tubarão-Martelo', grupo: 'Peixe', emoji: '🦈', profundidade: '1–80 m', curiosidade: 'A cabeça em forma de martelo detecta campos elétricos de presas escondidas.' },
  { nome: 'Tubarão-Baleia', grupo: 'Peixe', emoji: '🦈', profundidade: '0–700 m', curiosidade: 'Maior peixe do mundo. Apesar do tamanho, alimenta-se de plâncton.' },
  { nome: 'Peixe-Espada', grupo: 'Peixe', emoji: '🐟', profundidade: '0–800 m', curiosidade: 'Possui um órgão especial que aquece os olhos para melhorar a visão na caça.' },
  { nome: 'Peixe-Lanterna', grupo: 'Peixe', emoji: '🐟', profundidade: '200–1.000 m', curiosidade: 'Realiza migrações verticais diárias — sobe à noite e desce de dia.' },
  { nome: 'Atum', grupo: 'Peixe', emoji: '🐟', profundidade: '0–1.000 m', curiosidade: 'Um dos poucos peixes de sangue quente.' },
  { nome: 'Peixe-Bola', grupo: 'Peixe', emoji: '🐡', profundidade: '0–200 m', curiosidade: 'Seu veneno, a tetrodotoxina, é muito mais letal que o cianeto e não tem antídoto.' },
  { nome: 'Moreia', grupo: 'Peixe', emoji: '🐍', profundidade: '0–100 m', curiosidade: 'Possui uma segunda mandíbula na garganta que avança para puxar a presa.' },
  { nome: 'Cavalo-Marinho', grupo: 'Peixe', emoji: '🐴', profundidade: '0–30 m', curiosidade: 'Único animal em que o macho engravida e dá à luz.' },
  { nome: 'Raia-Manta', grupo: 'Peixe', emoji: '🌊', profundidade: '0–120 m', curiosidade: 'Tem o maior cérebro entre os peixes cartilaginosos.' },
  { nome: 'Baleia-Azul', grupo: 'Mamífero', emoji: '🐋', profundidade: '0–200 m', curiosidade: 'Maior animal já registrado: até 30 metros e 180 toneladas.' },
  { nome: 'Golfinho', grupo: 'Mamífero', emoji: '🐬', profundidade: '0–300 m', curiosidade: 'Usa ecolocalização para caçar. Um dos animais mais inteligentes.' },
  { nome: 'Orca', grupo: 'Mamífero', emoji: '🐳', profundidade: '0–200 m', curiosidade: 'É o maior membro da família dos golfinhos, não das baleias.' },
  { nome: 'Baleia-Jubarte', grupo: 'Mamífero', emoji: '🐋', profundidade: '0–200 m', curiosidade: 'Realiza migrações de até 25.000 km — uma das maiores entre os mamíferos.' },
  { nome: 'Narval', grupo: 'Mamífero', emoji: '🦄', profundidade: '0–1.500 m', curiosidade: 'O "unicórnio do mar". Seu dente em espiral pode atingir 3 metros.' },
  { nome: 'Beluga', grupo: 'Mamífero', emoji: '🐳', profundidade: '0–700 m', curiosidade: 'Chamada de "canário do mar" pela variedade de sons que emite.' },
  { nome: 'Dugongo', grupo: 'Mamífero', emoji: '🐄', profundidade: '0–37 m', curiosidade: 'Herbívoro marinho — primo distante do elefante.' },
  { nome: 'Foca-Leopardo', grupo: 'Mamífero', emoji: '🦭', profundidade: '0–600 m', curiosidade: 'Uma das principais predadoras da Antártida.' },
  { nome: 'Polvo-Gigante', grupo: 'Molusco', emoji: '🐙', profundidade: '0–2.000 m', curiosidade: 'Tem 3 corações, sangue azul e muda de cor em milissegundos.' },
  { nome: 'Lula-Gigante', grupo: 'Molusco', emoji: '🦑', profundidade: '300–2.000 m', curiosidade: 'Tem alguns dos maiores olhos do reino animal — até cerca de 27 cm de diâmetro.' },
  { nome: 'Caranguejo', grupo: 'Crustáceo', emoji: '🦀', profundidade: '0–4.000 m', curiosidade: 'Consegue regenerar garras e pernas perdidas.' },
  { nome: 'Lagosta', grupo: 'Crustáceo', emoji: '🦞', profundidade: '4–480 m', curiosidade: 'Pode viver mais de 100 anos sem sinais claros de envelhecimento.' },
  { nome: 'Camarão-Louva-a-Deus', grupo: 'Crustáceo', emoji: '🦐', profundidade: '3–40 m', curiosidade: 'Golpeia a cerca de 80 km/h — tão forte que quebra o vidro de aquários.' },
  { nome: 'Tartaruga-Marinha', grupo: 'Réptil', emoji: '🐢', profundidade: '0–1.000 m', curiosidade: 'Navega pelo campo magnético da Terra e volta à praia onde nasceu para desovar.' },
  { nome: 'Água-Viva', grupo: 'Cnidário', emoji: '🪼', profundidade: '0–4.000 m', curiosidade: 'É 95% água e existe há mais de 500 milhões de anos.' },
  { nome: 'Anêmona-do-Mar', grupo: 'Cnidário', emoji: '🌸', profundidade: '0–50 m', curiosidade: 'Predadora com tentáculos venenosos. Parceira do peixe-palhaço.' },
  { nome: 'Coral', grupo: 'Cnidário', emoji: '🪸', profundidade: '0–300 m', curiosidade: 'É um animal colonial, não uma planta.' },
  { nome: 'Estrela-do-Mar', grupo: 'Equinodermo', emoji: '⭐', profundidade: '0–6.000 m', curiosidade: 'Pode ter de 5 a 40 braços, todos regeneráveis.' },
  { nome: 'Pepino-do-Mar', grupo: 'Equinodermo', emoji: '🥒', profundidade: '0–10.900 m', curiosidade: 'Expele os próprios órgãos como defesa e depois os regenera.' },
  { nome: 'Ouriço-do-Mar', grupo: 'Equinodermo', emoji: '🦔', profundidade: '0–5.000 m', curiosidade: 'Algumas espécies vivem mais de 200 anos.' },
]
