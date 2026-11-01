import app from './app.js';
import { toKV } from './to-json.mjs';
import { readdirSync, readFileSync } from 'node:fs';
const store = new Map();
for (const f of readdirSync('src/content/posts')) { const { value, metadata } = toKV('src/content/posts/' + f); store.set('post:' + f.replace('.md', ''), { v: JSON.stringify(value), metadata }); }
store.set('asset:style.css', { v: readFileSync('src/styles/global.css', 'utf8') });
// aprova um para testar a home
const k = 'post:como-durar-mas-en-la-cama'; const e = store.get(k); e.metadata = { ...e.metadata, draft: false };
const env = { POSTS: {
  async get(key, type) { const e = store.get(key); if (!e) return null; return type === 'json' ? JSON.parse(e.v) : e.v; },
  async list({ prefix }) { return { keys: [...store].filter(([n]) => n.startsWith(prefix)).map(([name, e]) => ({ name, metadata: e.metadata })), list_complete: true }; },
} };
const out = process.argv[2];
for (const p of ['/', '/como-durar-mas-en-la-cama/', '/previa/', '/previa/ansiedad-de-desempeno-sexual/', '/eyaculacion-precoz-causas/', '/tema/control/', '/tema/pareja/', '/sobre/', '/sitemap.xml', '/rss.xml', '/robots.txt', '/style.css', '/x', '/nada/']) {
  const r = await app.fetch(new Request('https://blog.vexorhealth.com' + p), env);
  const t = await r.text();
  console.log(r.status, p, r.headers.get('location') || '', t.length);
  if (out && p.endsWith('/')) (await import('node:fs')).writeFileSync(out + '/' + (p.replace(/\//g, '_') || 'home') + '.html', t);
}
