// Controle de qualidade dos posts. Rode com: npm run check
// A automação diária roda isto antes de publicar; se falhar, o post não sobe.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'src/content/posts';
const banned = [
  /cura (definitiva|garantizada|en \d+ d[ií]as)/i,
  /garantizad[oa]s?/i,
  /100\s?% (efectivo|natural|seguro)/i,
  /milagro(so)?/i,
  /sin efectos secundarios/i,
  /m[eé]dicos (lo )?odian/i,
];
// "milagro" só é permitido em frases que criticam promessas milagrosas
const allowedMilagro = /(promesas|productos|soluci[oó]n(es)?)\s+["“]?milagr|["“]milagro["”]/i;

let errors = 0;
const fail = (file, msg) => { errors++; console.error(`✗ ${file}: ${msg}`); };

for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
  const raw = readFileSync(join(dir, file), 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) { fail(file, 'frontmatter ausente'); continue; }
  const [, fm, body] = m;

  const desc = (fm.match(/^description:\s*"(.*)"$/m) || [])[1] || '';
  if (desc.length < 80 || desc.length > 165) fail(file, `description com ${desc.length} caracteres (precisa 80–165)`);
  const title = (fm.match(/^title:\s*"(.*)"$/m) || [])[1] || '';
  if (title.length > 70) fail(file, `title com ${title.length} caracteres (máx. 70)`);

  const words = body.trim().split(/\s+/).length;
  if (words < 700) fail(file, `só ${words} palavras (mínimo 700)`);

  const sources = (fm.match(/^\s+- name:/gm) || []).length;
  if (sources < 2) fail(file, 'precisa de pelo menos 2 fontes');

  const h2 = (body.match(/^## /gm) || []).length;
  if (h2 < 4) fail(file, `só ${h2} subtítulos ## (mínimo 4)`);

  const internal = (body.match(/\]\(\/[a-z0-9-]+\/\)/g) || []).length;
  if (internal < 1) fail(file, 'precisa de pelo menos 1 link interno para outro post');

  if (!/m[eé]dico|ur[oó]logo|profesional/i.test(body)) fail(file, 'precisa indicar quando procurar um médico');

  for (const re of banned) {
    for (const line of body.split('\n')) {
      if (re.test(line) && !(re.source.startsWith('milagro') && allowedMilagro.test(line))) {
        fail(file, `promessa proibida: "${line.trim().slice(0, 80)}"`);
      }
    }
  }
  console.log(`✓ ${file} (${words} palavras)`);
}

if (errors) { console.error(`\n${errors} problema(s) encontrados.`); process.exit(1); }
console.log('\nTodos os posts passaram no controle de qualidade.');
