# AquaSite Mobile

Aplicativo do AquaSite em **React Native + TypeScript (Expo SDK 57)**.
É um projeto separado do site e usa **a mesma API e o mesmo banco de dados** que ele.

```
Site (React/Vite)  ─────┐
                        ├──> API Spring Boot (porta 4000) ───> SQL Server (aquabanco, somee.com)
App (React Native) ─────┘
```

O app não tem backend nem banco próprios. Ele chama os mesmos endpoints `/api/...` do site, com o mesmo login (token JWT). Uma conta, um post, uma mensagem ou uma comunidade criados no app aparecem no site, e vice-versa.

## Como rodar

1. **Suba a API** (a mesma do site), em `aquasite-backend`: `./gradlew bootRun`, ou dê dois cliques em `AquaSite_Apresentacao/Iniciar_AquaSite.bat`.
2. **Diga ao app onde a API está:** copie `.env.exemplo` para `.env` e ajuste `EXPO_PUBLIC_API_URL`:
   - celular de verdade (Expo Go): `http://<IP do computador>:4000`, com o celular no mesmo Wi-Fi. O IP aparece no comando `ipconfig`. Libere a porta 4000 no Firewall do Windows se o celular não conectar;
   - emulador Android: `http://10.0.2.2:4000`;
   - API publicada: `https://aquasite-server-1.onrender.com`. Só funciona depois que o código novo do backend for enviado ao GitHub e publicado; a versão que está no Render hoje é antiga.
3. Instale e abra:
   ```
   npm install
   npx expo start
   ```
   Leia o QR code com o app **Expo Go** (Android/iOS), ou aperte `a` para abrir no emulador Android.

Checagens: `npm test` (45 testes automatizados), `npm run typecheck` (tipos) e `npx expo-doctor` (configuração).

## Testes automatizados

`npm test` roda 45 testes (Jest + jest-expo + Testing Library), em `src/__testes__/`:
- **regras do app:** alertas do mar, força da senha, formatação, praias, conquistas e catálogo de animais;
- **camada da API:** confere que o app chama os mesmos endpoints do site, com o token JWT, e trata sessão expirada, erro da API e falta de conexão. O `fetch` é simulado, então nenhum teste acessa o banco;
- **cópia local do feed:** o que é guardado para quando não há internet;
- **componentes:** botão, cartão de post (curtir, comentar, apagar só pelo autor, aviso de post oculto) e a página de animais (filtro e busca).

## Gerar o APK (app instalável no Android)

Precisa de uma conta gratuita na Expo (expo.dev), e o build é feito na nuvem da Expo:
```
npx eas-cli@latest login
npx eas-cli@latest init        # cria o projeto na Expo e grava o projectId no app.json
npx eas-cli@latest build -p android --profile preview
```
No fim aparece um link e um QR code para baixar o `.apk` e instalar no celular.
O perfil `preview` (arquivo `eas.json`) aponta para a API publicada (`https://aquasite-server-1.onrender.com`). O Android não aceita endereços `http://` em apps instalados, por isso o APK precisa da API em HTTPS. **Antes, publique o código novo do backend no Render**: a versão que está lá hoje é antiga.

## Notificações push

Curtidas, comentários, seguidores, mensagens, pedidos da Comunidade e avisos de moderação chegam como push no celular.
- A API guarda o aparelho de cada pessoa (tabela `dispositivos_push`, rotas `POST/DELETE /api/push/dispositivo`).
- Toda notificação gravada no banco, a mesma que o site mostra, também vai para o serviço de push da Expo.
- Funciona no **APK** (depois do `eas init`). No Expo Go para Android o push remoto não existe, e no navegador também não; nesses casos o app segue normalmente, sem push.

## Aparência, acessibilidade e sem internet

- **Perfil → Aparência e acessibilidade**, e também na tela de entrada:
  - tema escuro ou claro (as mesmas cores do site);
  - alto contraste;
  - menos animações.

  O tamanho das letras segue o do celular.
- **Sem internet:** o feed mostra a última cópia salva no aparelho, com um aviso. Publicar, curtir e comentar continuam indo para a API.
- **Fotos:** antes de enviar, o app reduz a foto para no máximo 1080 px (foto de perfil: 512 px), para o feed carregar mais rápido e o banco ficar menor.

## Estrutura

```
App.tsx                 provedores (sessão, presença) + navegação
index.ts                ponto de entrada do Expo
src/
  config/ambiente.ts    endereço da API (EXPO_PUBLIC_API_URL)
  services/
    http.ts             cliente HTTP: token JWT, erros, sessão expirada (401)
    api.ts              TODOS os endpoints usados (os mesmos do site)
    armazenamento.ts    token guardado no SecureStore do aparelho
    clima.ts            Open-Meteo, Nominatim e OSRM (as mesmas fontes do Mapa do site)
  contexts/             AuthContext (login/cadastro/sair) e PresencaContext (online + não lidas)
  hooks/                useCarregar, useLocalizacao, usePresenca
  navigation/           RootNavigator (pilha) e AbasNavigator (abas de baixo)
  screens/              uma tela por arquivo .tsx
  components/           Botao, Campo, Avatar, PostCard, Folha, Chips, ImagemAmpliavel...
  types/                api.ts (formato do JSON da API) e navegacao.ts (parâmetros das telas)
  utils/                praias, alertas do mar, senha, imagens, formatação
  data/conteudo.ts      textos fixos que o site também guarda no front (temas, dicas, equipe)
```

Todo o código é `.ts` (lógica) ou `.tsx` (telas e componentes). Não há `.js` nem `.jsx`.

## Funcionalidades (mesmas do site)

| Tela | O que faz | Endpoints |
|---|---|---|
| Entrar | login, cadastro com foto e bio, força da senha, "Esqueci minha senha", explorar sem conta | `POST /api/users/login`, `/register` |
| Feed | publicar texto/foto, curtir, comentar, compartilhar, denunciar, apagar, páginas de 20, atualização automática, praia mais próxima | `/api/posts`, `/api/denuncias` |
| Mapa | praias em destaque, busca, toque no litoral, rota de carro, tempo, mar, maré, previsão, **alertas de risco**, avisos da comunidade | `/api/beach-reports` + Open-Meteo/Nominatim/OSRM |
| Comunidade | ONGs e comunidades, filtros, participar/sair, pedir para entrar, pedidos (admin da comunidade), pública/privada, solicitar comunidade, sugerir ONG | `/api/comunidade/...` |
| Feed da comunidade | publicar, curtir, comentar, apagar | `/api/comunidade/{tipo}/{id}/posts`, `/feed/...` |
| Mensagens | conversas, chat com foto, apagar para mim/para todos, atualização a cada 4 s | `/api/messages/...` |
| Notificações | lista, marca como lidas, contador no sino, avisos de moderação | `/api/notifications/...` |
| Perfil | foto (galeria/câmera), nome de usuário, bio, seguidores/seguindo, conquistas, meus posts, trocar senha, senha temporária, sair | `/api/users/...` |
| Perfil de outra pessoa | seguir, mensagem, denunciar, posts | `/api/users/{u}/...` |
| Pesquisar | usuários e posts | `/api/search` |
| Animais marinhos | catálogo de 35 espécies em 7 grupos, com busca, filtro e ficha de cada animal | (conteúdo fixo, do app original do grupo) |
| Animais marinhos (banco) | espécies cadastradas pelos administradores aparecem no topo da página de animais | `GET /api/especies` |
| Curiosidades e Sobre | conteúdo educativo e equipe | (conteúdo fixo, como no site) |
| Painel admin | usuários (excluir, senha temporária), posts (ocultar/mostrar/excluir), espécies, denúncias de praia e de conteúdo, ONGs e comunidades | `/api/admin/...` |
