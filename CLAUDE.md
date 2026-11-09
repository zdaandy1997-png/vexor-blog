# VEXOR Blog — blog.vexorhealth.com

O dono é iniciante em programação: nunca peça para ele rodar comandos. Responda em português.

## Como o blog funciona hoje
- O site é o Cloudflare Worker `vexor-blog` (código em `worker/app.js`), conta 9f49d2ec4366a5a6ab296329eec0663f.
- Posts, fotos, pins, fila de pautas e CSS ficam no KV `vexor-blog-posts` (id 9a10ad86101c486788c842bcd464f317). Detalhes no doc do projeto `claude/blog-vexor.md`.
- As pastas `src/`, `pautas.md`, `astro.config.mjs` e `scripts/` são da versão antiga em Astro e NÃO são usadas.

## Produção de posts
- Feita pela tarefa agendada "Posts VEXOR Blog (3x ao dia)" (7h40, 13h40 e 19h40, Brasília). As regras completas estão no prompt dessa tarefa.
- Publicação automática (decisão do dono em 2026-11-09): 3 posts por dia, publicados com draft:false e approved:true depois de uma revisão rigorosa. Se a revisão falhar, o post fica como rascunho em /previa/<slug>/ e o dono aprova respondendo "aprovado".
- Pins: 1 por post novo + 2 variações de posts antigos por dia, publicados no Pinterest pelo feed /pins.xml.

## Regras de conteúdo
- Espanhol neutro latino-americano, tratando por "tú". Público: México, Colômbia, Peru e Chile.
- Só fontes confiáveis (Mayo Clinic, Cleveland Clinic, NHS, MedlinePlus, OMS/OPS, sociedades médicas, PubMed/PMC). Nunca inventar fonte, número ou URL.
- Nunca prometer cura, resultado ou prazo; nunca dar dose de medicamento ou suplemento; sempre dizer quando procurar médico.
- Nunca repetir assunto. Pelo menos 2 de cada 3 posts com temas Discover (hábitos, sono, alimentação, exercício, estresse, coração).
- Fotos por IA só com composições seguras (sem close de pessoas, sem mãos/braços em destaque).

## Alterar o Worker
- Edite `worker/app.js`, teste localmente, e faça o deploy pela API da Cloudflare conferindo o hash do código antes e depois.
- Novas versões podem levar alguns minutos para aparecer no site.
