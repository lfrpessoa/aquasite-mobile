import { Platform } from 'react-native'

/**
 * Endereço da MESMA API (Spring Boot) usada pelo site. O app não tem backend próprio.
 *
 * Defina EXPO_PUBLIC_API_URL no arquivo .env (modelo em .env.exemplo):
 *  - celular de verdade (Expo Go): http://<IP do computador na rede Wi-Fi>:4000
 *  - emulador Android: http://10.0.2.2:4000 (é o "localhost" do computador visto pelo emulador)
 *  - simulador iOS e navegador: http://localhost:4000
 *  - API publicada: https://aquasite-server-1.onrender.com (depois que o código novo for publicado)
 */
const padrao = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000'

export const API_URL: string = (process.env.EXPO_PUBLIC_API_URL || padrao).replace(/\/+$/, '')

/** A cada quanto tempo o app avisa a API que a pessoa está online (o site usa o mesmo valor). */
export const HEARTBEAT_MS = 25_000

/** Posts por página no feed (igual ao "Carregar mais" do site). */
export const POSTS_POR_PAGINA = 20

/**
 * Endereço do SITE do AquaSite. Os links de compartilhar (post, comentário, comunidade) apontam para ele,
 * para abrirem em qualquer navegador; dentro do app, links desse endereço abrem a tela certa.
 */
export const SITE_URL: string = (process.env.EXPO_PUBLIC_SITE_URL || 'https://aquasite-frontend-aquasite-react.vercel.app').replace(/\/+$/, '')
