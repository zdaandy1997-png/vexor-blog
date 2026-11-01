// Empacota a pasta dist/ num único Worker da Cloudflare (sem precisar de GitHub nem wrangler).
// Gera deploy/worker.js. Uso: npm run build && node scripts/build-worker.mjs
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = 'dist';
const files = {};
const walk = (d) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else files['/' + relative(root, p).split('\\').join('/')] = readFileSync(p, 'utf8');
  }
};
walk(root);

const b64 = gzipSync(Buffer.from(JSON.stringify(files)), { level: 9 }).toString('base64');

const worker = `const B64="${b64}";
let F;
async function load(){if(F)return F;const bin=Uint8Array.from(atob(B64),c=>c.charCodeAt(0));F=await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream("gzip"))).json();return F;}
const T={html:"text/html; charset=utf-8",css:"text/css; charset=utf-8",svg:"image/svg+xml",xml:"application/xml; charset=utf-8",txt:"text/plain; charset=utf-8",js:"application/javascript"};
export default{async fetch(req){const f=await load();const u=new URL(req.url);let p=decodeURIComponent(u.pathname);
if(!p.endsWith("/")&&f[p]===undefined&&f[p+"/index.html"]!==undefined)return Response.redirect(u.origin+p+"/"+u.search,301);
if(p.endsWith("/"))p+="index.html";let body=f[p],status=200;if(body===undefined){body=f["/404.html"];status=404;p="/404.html";}
const h={"content-type":T[p.split(".").pop()]||"text/plain","cache-control":p.startsWith("/_astro/")?"public, max-age=31536000, immutable":"public, max-age=300","x-content-type-options":"nosniff"};
if(p.startsWith("/previa/"))h["x-robots-tag"]="noindex, nofollow";
return new Response(body,{status,headers:h});}};
`;
mkdirSync('deploy', { recursive: true });
writeFileSync('deploy/worker.js', worker);
console.log(`deploy/worker.js pronto: ${Object.keys(files).length} arquivos, ${worker.length} bytes`);
