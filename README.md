# VEXOR Blog — blog.vexorhealth.com

Blog em espanhol do VEXOR Health para ranquear no Google, levar leitores ao quiz/low ticket e monetizar com AdSense.

## Como funciona (resumo simples)
- Cada post é um arquivo de texto em `src/content/posts/`.
- Todo dia o Claude escreve um post novo seguindo `CLAUDE.md`, pegando o tema da fila `pautas.md`.
- O post nasce como **rascunho** e aparece só em `blog.vexorhealth.com/previa/` (o Google não vê).
- Você lê no celular e responde "aprovado" no chat. O Claude publica.
- A Cloudflare atualiza o site sozinha a cada envio para o GitHub.

## Onde mudar as coisas
| O que | Arquivo |
|---|---|
| Link dos botões (quiz/venda) | `src/consts.ts` → `CTA_URL` |
| ID do AdSense (quando aprovar) | `src/consts.ts` → `ADSENSE_CLIENT` |
| E-mail de contato | `src/consts.ts` → `CONTACT_EMAIL` |
| Lista de temas futuros | `pautas.md` |
| Textos dos botões | `src/components/Cta.astro` |

## Colocar no ar na Cloudflare (uma vez só)
1. Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → escolha `vexor-blog`.
2. Framework preset: **Astro**. Build command: `npm run build`. Output: `dist`.
3. Depois do primeiro deploy: **Custom domains** → `blog.vexorhealth.com`.

## AdSense (depois de ter uns 15–20 posts publicados)
1. Peça aprovação em adsense.google.com com o site `blog.vexorhealth.com`.
2. Quando aprovar, cole o ID `ca-pub-...` em `src/consts.ts` e crie `public/ads.txt` com a linha que o AdSense mostrar.

## Comandos (para o Claude)
- `npm run dev` — ver localmente
- `npm run check` — controle de qualidade dos posts
- `npm run build` — gerar o site
