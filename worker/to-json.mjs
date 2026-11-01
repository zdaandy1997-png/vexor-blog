// Converte um post .md (frontmatter + corpo) no formato guardado no KV: { value, metadata }
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

export function toKV(file) {
  const raw = readFileSync(file, 'utf8');
  const [, fm, body] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const d = parse(fm);
  const date = (x) => (x instanceof Date ? x.toISOString().slice(0, 10) : x);
  const post = { ...d, pubDate: date(d.pubDate), updatedDate: d.updatedDate ? date(d.updatedDate) : undefined, faq: d.faq || [], tags: d.tags || [], draft: !!d.draft, body: body.trim() };
  const metadata = { title: post.title, description: post.description, pubDate: post.pubDate, updatedDate: post.updatedDate, category: post.category, draft: post.draft, minutes: Math.max(1, Math.round(body.trim().split(/\s+/).length / 220)) };
  return { value: post, metadata };
}

if (import.meta.url === 'file://' + process.argv[1]) console.log(JSON.stringify(toKV(process.argv[2])));
