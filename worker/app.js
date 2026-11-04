// VEXOR Blog — Worker da Cloudflare. Posts ficam no KV (binding POSTS), chave "post:<slug>".
const SITE = 'https://blog.vexorhealth.com';
const NAME = 'VEXOR Blog';
const DESC = 'Guías claras y basadas en evidencia sobre control, ansiedad de desempeño, hábitos y bienestar íntimo masculino. Sin juicios y sin promesas milagrosas.';
const CTA = 'https://vexorhealth.com/';
const EMAIL = 'contacto@vexorhealth.com';
const ADSENSE = ''; // cole o ca-pub-... quando o AdSense aprovar
const AUTHOR = { name: 'Equipo Editorial VEXOR', bio: 'Redactamos guías educativas sobre bienestar masculino a partir de fuentes médicas y científicas reconocidas. Nuestro contenido no sustituye la consulta con un profesional de la salud.' };
const CATS = {
  control: ['Control y duración', 'Técnicas, ejercicios y explicaciones sobre la eyaculación precoz y el control.'],
  ansiedad: ['Ansiedad y mente', 'Ansiedad de desempeño, estrés, respiración y confianza en la intimidad.'],
  ereccion: ['Erección y circulación', 'Cómo funciona la erección, qué la afecta y qué hábitos la cuidan.'],
  habitos: ['Hábitos y energía', 'Sueño, alimentación, ejercicio y estilo de vida para el bienestar masculino.'],
  pareja: ['Pareja y comunicación', 'Cómo hablar del tema, reducir la presión y mejorar la conexión.'],
};
const CTA_COPY = {
  control: ['¿Quieres un plan, no solo información?', 'El programa VEXOR te guía 28 días con ejercicios cortos de control, respiración y hábitos. Empieza con un test discreto de 2 minutos.'],
  ansiedad: ['Entrena la calma, no solo la entiendas', 'VEXOR combina respiración guiada, atención y prácticas diarias para bajar la presión en la intimidad. Haz el test y recibe tu ruta.'],
  ereccion: ['Cuida tu respuesta con hábitos que suman', 'Un recorrido de 28 días con acciones simples de sueño, movimiento, respiración y suelo pélvico. Descubre por dónde empezar.'],
  habitos: ['Convierte hábitos en resultados diarios', 'VEXOR organiza sueño, energía y bienestar íntimo en un plan de 28 días, desde tu celular y con total discreción.'],
  pareja: ['Menos presión, más conexión', 'El programa VEXOR te ayuda a entender tu cuerpo y bajar la ansiedad paso a paso. Empieza con un test discreto.'],
};

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fmtDate = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const today = () => new Date().toISOString().slice(0, 10);
const words = (s) => s.trim().split(/\s+/).length;

// ---------- markdown simples ----------
function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*(?:)/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*(?:)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => `<a href="${u}"${u.startsWith('http') ? ' rel="nofollow noopener" target="_blank"' : ''}>${t}</a>`);
}
function md(src, figs = {}) {
  const lines = src.replace(/\r/g, '').split('\n');
  const out = [], toc = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{2,3}) (.+)$/))) {
      const id = slugify(m[2]); const lvl = m[1].length;
      if (lvl === 2) toc.push([id, m[2]]);
      out.push(`<h${lvl} id="${id}">${inline(m[2])}</h${lvl}>`); i++; continue;
    }
    if ((m = l.match(/^\[\[figura:([a-z0-9-]+)\]\]$/))) {
      const f = figs[m[1]]; i++;
      if (f && safeSvg(f.svg)) out.push(`<figure class="figure reveal"><div role="img" aria-label="${esc(f.alt || f.caption || '')}">${f.svg}</div>${f.caption ? `<figcaption>${inline(f.caption)}</figcaption>` : ''}</figure>`);
      continue;
    }
    if (l.startsWith('>')) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith('>')) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote><p>${inline(buf.join(' '))}</p></blockquote>`); continue;
    }
    if (l.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      out.push(`<table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
      continue;
    }
    if (/^(- |\d+\. )/.test(l)) {
      const ordered = /^\d+\. /.test(l); const items = [];
      while (i < lines.length && /^(- |\d+\. )/.test(lines[i])) items.push(lines[i++].replace(/^(- |\d+\. )/, ''));
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</${tag}>`); continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3} |>|\||- |\d+\. |\[\[figura:)/.test(lines[i])) buf.push(lines[i++]);
    out.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return { html: out.join('\n'), toc };
}

const safeSvg = (s = '') => /^<svg[\s>]/.test(s.trim()) && !/<script|<foreignObject|\son[a-z]+\s*=|javascript:|<iframe|<image/i.test(s) && s.length < 40000;

// capa ilustrada (usada quando o post não tem foto)
const ICONS = {
  control: '<path class="d-accent-s" stroke-width="6" stroke-linecap="round" d="M470 300 C 520 180, 600 180, 640 260 S 760 380, 830 220"/><circle class="d-accent" cx="640" cy="260" r="12"/>',
  ansiedad: '<circle class="d-accent-s" stroke-width="5" cx="650" cy="270" r="70"/><circle class="d-accent-s" stroke-width="3" opacity=".6" cx="650" cy="270" r="115"/><circle class="d-accent-s" stroke-width="2" opacity=".35" cx="650" cy="270" r="160"/>',
  ereccion: '<path class="d-accent-s" stroke-width="6" stroke-linecap="round" d="M470 300 h70 l30 -90 l40 170 l35 -120 l25 40 h160"/>',
  habitos: '<circle class="d-accent-s" stroke-width="6" cx="650" cy="270" r="95"/><path class="d-accent-s" stroke-width="6" stroke-linecap="round" d="M650 200 v70 l50 30"/>',
  pareja: '<circle class="d-accent-s" stroke-width="6" cx="610" cy="270" r="80"/><circle class="d-accent-s" stroke-width="6" cx="700" cy="270" r="80"/>',
};
function coverSvg(slug, category) {
  let h = 0; for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const dots = Array.from({ length: 14 }, (_, k) => { const x = 60 + ((h >> (k % 16)) * (k + 7)) % 1100; const y = 40 + ((h >> ((k + 5) % 16)) * (k + 3)) % 500; return `<circle class="d-accent" opacity="${0.15 + (k % 4) / 10}" cx="${x}" cy="${y}" r="${2 + (k % 3)}"/>`; }).join('');
  const lines = Array.from({ length: 12 }, (_, k) => `<path class="d-line" d="M${k * 100} 0 V576 M0 ${k * 48} H1200"/>`).join('');
  return `<svg viewBox="0 0 1200 576" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice"><rect width="1200" height="576" class="d-panel"/>${lines}<circle class="d-soft" cx="650" cy="270" r="260"/>${dots}${ICONS[category] || ICONS.control}</svg>`;
}
const imgUrl = (slug, v) => `/img/${slug}.jpg${v ? '?v=' + v : ''}`;
const media = (p, cls) => p.img ? `<img src="${imgUrl(p.slug, p.imgV)}" alt="${esc(p.imgAlt || p.title)}" width="1600" height="896" ${cls === 'hero' ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">` : coverSvg(p.slug, p.category);

// ---------- dados ----------
async function allPosts(env) {
  const list = [];
  let cursor;
  do {
    const r = await env.POSTS.list({ prefix: 'post:', cursor });
    for (const k of r.keys) if (k.metadata) list.push({ slug: k.name.slice(5), ...k.metadata });
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  return list.sort((a, b) => (b.pubDate > a.pubDate ? 1 : -1));
}
const isLive = (p) => p.approved === true && !p.draft && p.pubDate <= today();
async function getPost(env, slug) { return env.POSTS.get('post:' + slug, 'json'); }

// ---------- layout ----------
function page({ title, description = DESC, path, body, noindex = false, schema = [], top = '', ogType = 'website', image = '' }) {
  const full = title === NAME ? title : `${title} | ${NAME}`;
  const url = SITE + path;
  const nav = Object.entries(CATS).slice(0, 4).map(([k, c]) => `<a href="/tema/${k}/">${c[0].split(' y ')[0]}</a>`).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${url}">
${noindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">'}<meta name="theme-color" content="#f5f8f7"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="${NAME}" href="/rss.xml">
<meta property="og:type" content="${ogType}"><meta property="og:title" content="${esc(full)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="${NAME}"><meta property="og:locale" content="es_MX">${image ? `<meta property="og:image" content="${SITE}${image}"><meta property="og:image:width" content="1600"><meta property="og:image:height" content="896"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${SITE}${image}">` : '<meta name="twitter:card" content="summary">'}
<script>try{if(localStorage.getItem('vx-theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css?v=2">
${ADSENSE && !noindex ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE}" crossorigin="anonymous"></script>` : ''}
${schema.map((s) => `<script type="application/ld+json">${JSON.stringify(s).replace(/</g, '\\u003c')}</script>`).join('')}
</head><body>${top}
<header class="site-header"><div class="wrap"><a class="logo" href="/"><span class="logo-dot"></span>VEXOR <small>Blog</small></a><nav class="nav" aria-label="Temas">${nav}</nav><div class="head-actions"><button class="theme-toggle" id="theme-toggle" type="button" aria-label="Cambiar modo claro u oscuro"><svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg><svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button><a class="btn btn-sm" href="${CTA}?utm_source=blog&utm_medium=header&utm_campaign=organico">Haz el test</a></div></div></header>
<main>${body}</main>
<footer class="site-footer"><div class="wrap"><div class="cols"><div><a class="logo" href="/"><span class="logo-dot"></span>VEXOR <small>Blog</small></a><p>Ciencia simple para el bienestar masculino.</p></div>
<nav aria-label="Legal"><a href="/sobre/">Quiénes somos</a><a href="/politica-editorial/">Política editorial</a><a href="/aviso-medico/">Aviso médico</a><a href="/privacidad/">Privacidad</a><a href="/contacto/">Contacto</a></nav></div>
<p class="legal">El contenido de este sitio es educativo y no sustituye el diagnóstico ni el tratamiento de un profesional de la salud. Si tienes síntomas persistentes, dolor o dudas sobre medicamentos, consulta a un médico. © ${new Date().getFullYear()} VEXOR Health.</p></div></footer>
<script src="/app.js" defer></script></body></html>`;
}

const card = (p, featured = false) => `<a class="card reveal${featured ? ' card-featured' : ''}" href="/${p.slug}/"><div class="card-img">${media(p)}</div><span class="tag">${CATS[p.category][0]}</span>${featured ? '<h2>' : '<h3>'}${esc(p.title)}${featured ? '</h2>' : '</h3>'}<p>${esc(p.description)}</p><div class="meta"><time datetime="${p.pubDate}">${fmtDate(p.pubDate)}</time><span>·</span><span>${p.minutes} min de lectura</span></div></a>`;

const ctaBox = (variant, slug, cat) => {
  const c = CTA_COPY[cat] || CTA_COPY.control;
  return `<aside class="cta reveal" aria-label="Programa VEXOR"><div class="scan"></div><span class="eyebrow">● Programa VEXOR</span><h3>${c[0]}</h3><p>${c[1]}</p><a class="btn" href="${CTA}?utm_source=blog&utm_medium=cta_${variant}&utm_campaign=${encodeURIComponent(slug)}">Hacer el test gratis →</a><p class="cta-fine">Educativo y discreto. No es un tratamiento médico.</p></aside>`;
};
const adSlot = () => ADSENSE ? `<div class="ad-slot"><div class="ad-label">Publicidad</div><ins class="adsbygoogle" style="display:block" data-ad-client="${ADSENSE}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>` : '';

async function postPage(env, post, slug, preview) {
  const { html, toc } = md(post.body, Object.fromEntries((post.figures || []).map((f) => [f.id, f])));
  const meta = { ...post, slug, img: post.img };
  const cat = CATS[post.category];
  const url = `${SITE}/${slug}/`;
  // CTA + anúncio antes do 3º subtítulo
  let bodyHtml = html;
  const h2s = [...html.matchAll(/<h2 /g)];
  if (h2s.length >= 3) bodyHtml = html.slice(0, h2s[2].index) + ctaBox('mid', slug, post.category) + adSlot() + html.slice(h2s[2].index);
  const related = (await allPosts(env)).filter((p) => isLive(p) && p.slug !== slug && p.category === post.category).slice(0, 3);
  const schema = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: post.title, description: post.description, datePublished: post.pubDate, dateModified: post.updatedDate || post.pubDate, inLanguage: 'es', mainEntityOfPage: url,
      author: { '@type': 'Organization', name: AUTHOR.name, url: SITE + '/sobre/' }, publisher: { '@type': 'Organization', name: NAME, url: SITE + '/' }, citation: post.sources.map((s) => s.url), image: post.img ? SITE + imgUrl(slug, post.imgV) : undefined },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: cat[0], item: `${SITE}/tema/${post.category}/` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url }] },
  ];
  if (post.faq?.length) schema.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: post.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  const body = `<div class="progress" id="progress"></div><article class="read">
<header class="post-head"><nav class="breadcrumbs"><a href="/">Inicio</a> / <a href="/tema/${post.category}/">${cat[0]}</a></nav><h1>${esc(post.title)}</h1><p class="lead">${esc(post.description)}</p>
<div class="meta"><span>Por <a href="/sobre/">${AUTHOR.name}</a></span><span>·</span><time datetime="${post.pubDate}">${fmtDate(post.pubDate)}</time>${post.updatedDate ? `<span>·</span><span>Actualizado ${fmtDate(post.updatedDate)}</span>` : ''}<span>·</span><span>${Math.max(1, Math.round(words(post.body) / 220))} min</span></div></header>
<div class="post-hero">${media(meta, 'hero')}</div>${post.img ? '<p class="post-hero-cap">Imagen ilustrativa generada con IA.</p>' : ''}
<p class="disclaimer-top">Contenido educativo. No sustituye la consulta médica. Si el problema es persistente, causa dolor o malestar importante, habla con un médico o urólogo.</p>
${toc.length > 2 ? `<details class="toc" open><summary>En este artículo</summary><ol>${toc.map(([id, t]) => `<li><a href="#${id}">${inline(t)}</a></li>`).join('')}</ol></details>` : ''}
<div class="prose">${bodyHtml}</div>
${post.faq?.length ? `<section class="faq prose"><h2 id="preguntas-frecuentes">Preguntas frecuentes</h2>${post.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</section>` : ''}
${ctaBox('end', slug, post.category)}
<section class="sources"><h2>Fuentes</h2><ol>${post.sources.map((s) => `<li><a href="${esc(s.url)}" rel="nofollow noopener" target="_blank">${esc(s.name)}</a></li>`).join('')}</ol></section>
<div class="author-box"><div class="avatar">V</div><div><strong>${AUTHOR.name}</strong><p>${AUTHOR.bio} <a href="/politica-editorial/">Cómo hacemos nuestro contenido</a>.</p></div></div></article>
${related.length ? `<section class="wrap"><h2>Sigue leyendo</h2><div class="grid">${related.map((p) => card(p)).join('')}</div></section>` : ''}`;
  return page({ title: post.title, description: post.description, path: `/${slug}/`, body, noindex: preview, schema: preview ? [] : schema, ogType: 'article', image: post.img ? imgUrl(slug, post.imgV) : '',
    top: preview ? '<div class="draft-bar">PRÉVIA — rascunho ainda não publicado (o Google não vê esta página)</div>' : '' });
}

const STATIC = {
  sobre: ['Quiénes somos', 'Conoce al equipo detrás de VEXOR Blog y por qué hablamos de bienestar masculino sin tabúes ni promesas milagrosas.',
    `<p>VEXOR nació de una idea simple: muchos hombres viven con dudas sobre su intimidad —el control, la ansiedad de desempeño, la erección— y sienten vergüenza de preguntar. Terminan buscando respuestas en anuncios exagerados o en foros sin ningún respaldo.</p><p>Este blog existe para ofrecer lo contrario: <strong>explicaciones claras, sin juicios y basadas en fuentes médicas y científicas reconocidas</strong>.</p><h2>Quién escribe</h2><p>${AUTHOR.bio}</p><p>Cada artículo cita sus fuentes al final y se revisa cuando aparece información nueva. Puedes leer cómo trabajamos en nuestra <a href="/politica-editorial/">política editorial</a>.</p><h2>Qué es VEXOR Health</h2><p>VEXOR Health es una plataforma digital educativa de bienestar masculino, pensada para el celular. Su programa de 28 días combina contenidos cortos, respiración guiada, ejercicios y hábitos diarios. No es un medicamento ni un tratamiento médico, y no reemplaza la atención profesional.</p><p><a class="btn" href="${CTA}?utm_source=blog&utm_medium=sobre">Conocer el programa →</a></p>`],
  'politica-editorial': ['Política editorial', 'Cómo investigamos, escribimos y actualizamos los artículos de VEXOR Blog sobre salud y bienestar masculino.',
    `<h2>Nuestros principios</h2><ul><li><strong>Fuentes reconocidas.</strong> Basamos cada artículo en organizaciones médicas, guías clínicas y estudios publicados en revistas revisadas por pares. Todas las fuentes se listan al final del texto.</li><li><strong>Sin promesas de cura.</strong> No prometemos resultados garantizados ni “curas en días”. Explicamos lo que dice la evidencia, incluidas sus limitaciones.</li><li><strong>Educación, no diagnóstico.</strong> Nuestro contenido no reemplaza la evaluación de un médico. Indicamos cuándo conviene buscar ayuda profesional.</li><li><strong>Transparencia comercial.</strong> VEXOR Blog pertenece a VEXOR Health. Cuando mencionamos nuestro programa, lo identificamos claramente. El sitio también puede mostrar anuncios de terceros, identificados como “Publicidad”.</li><li><strong>Actualización.</strong> Revisamos los artículos cuando surge evidencia nueva e indicamos la fecha de actualización.</li></ul><h2>Uso de herramientas</h2><p>Usamos herramientas de inteligencia artificial para apoyar la investigación y la redacción. Cada texto sigue estas reglas editoriales, se basa en las fuentes citadas y pasa por revisión del equipo antes de publicarse.</p><h2>Correcciones</h2><p>Si encuentras un error, escríbenos a <a href="mailto:${EMAIL}">${EMAIL}</a>. Corregimos lo antes posible.</p>`],
  'aviso-medico': ['Aviso médico', 'El contenido de VEXOR Blog es educativo y no sustituye el consejo, diagnóstico ni tratamiento de un profesional de la salud.',
    `<p>Todo el contenido de VEXOR Blog tiene fines <strong>exclusivamente educativos e informativos</strong>. No constituye consejo médico, diagnóstico ni tratamiento.</p><p>Nunca ignores el consejo de un profesional de la salud ni retrases buscar atención por algo que hayas leído aquí. Consulta a un médico o urólogo si:</p><ul><li>el problema es persistente o afecta tu bienestar o tu relación;</li><li>sientes dolor, notas sangre, cambios en la piel o en la forma del pene;</li><li>las dificultades de erección aparecen junto a síntomas cardiovasculares, diabetes o presión alta;</li><li>estás pensando en tomar medicamentos o suplementos, o ya tomas otros medicamentos;</li><li>sientes ansiedad o tristeza intensas.</li></ul><p>Las dificultades sexuales pueden ser una señal temprana de otras condiciones de salud, por eso una evaluación profesional es importante.</p><p>Si tienes una emergencia, llama a los servicios de emergencia de tu país.</p>`],
  privacidad: ['Política de privacidad', 'Cómo VEXOR Blog trata los datos de navegación, cookies y publicidad de terceros como Google AdSense.',
    `<p><em>Última actualización: 31 de octubre de 2026.</em></p><h2>Qué datos recopilamos</h2><p>VEXOR Blog no exige registro. Podemos recopilar datos técnicos de navegación (como páginas visitadas, tipo de dispositivo y país aproximado) mediante herramientas de analítica, de forma agregada.</p><h2>Cookies y publicidad</h2><p>Este sitio puede mostrar anuncios de <strong>Google AdSense</strong>. Proveedores externos, incluido Google, utilizan cookies para mostrar anuncios basados en visitas anteriores del usuario a este u otros sitios web.</p><p>El uso de cookies publicitarias permite a Google y a sus socios mostrar anuncios basados en las visitas a este sitio y/o a otros sitios de Internet. Puedes desactivar la publicidad personalizada en la <a href="https://adssettings.google.com" rel="nofollow noopener" target="_blank">Configuración de anuncios de Google</a>, o desactivar las cookies de terceros en <a href="https://www.aboutads.info" rel="nofollow noopener" target="_blank">www.aboutads.info</a>.</p><p>Más información sobre cómo Google usa los datos: <a href="https://policies.google.com/technologies/partner-sites" rel="nofollow noopener" target="_blank">policies.google.com/technologies/partner-sites</a>.</p><h2>Enlaces a VEXOR Health</h2><p>Algunos enlaces llevan a vexorhealth.com e incluyen parámetros de campaña (UTM) para saber qué artículos son útiles. Allí se aplica la política de privacidad de VEXOR Health.</p><h2>Tus derechos</h2><p>Puedes solicitar información o la eliminación de cualquier dato que tengamos sobre ti escribiendo a <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>`],
  contacto: ['Contacto', 'Escríbenos para dudas, sugerencias de temas o correcciones sobre los artículos de VEXOR Blog.',
    `<p>¿Tienes una duda, una sugerencia de tema o encontraste un error? Escríbenos:</p><p><a class="btn" href="mailto:${EMAIL}">${EMAIL}</a></p><p>No respondemos consultas médicas individuales. Para eso, consulta a un profesional de la salud.</p>`],
};

const FAVICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#06090a"/><path d="M16 18 L32 46 L48 18" fill="none" stroke="#2ee59d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CLIENT_JS = `const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
document.querySelectorAll('.card').forEach(c=>c.addEventListener('pointermove',ev=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',ev.clientX-r.left+'px');c.style.setProperty('--my',ev.clientY-r.top+'px')}));
const tt=document.getElementById('theme-toggle');if(tt)tt.addEventListener('click',()=>{const d=document.documentElement;const dark=d.dataset.theme!=='dark';if(dark)d.dataset.theme='dark';else delete d.dataset.theme;try{localStorage.setItem('vx-theme',dark?'dark':'light')}catch(e){}});
const bar=document.getElementById('progress');if(bar)document.addEventListener('scroll',()=>{const h=document.documentElement;bar.style.width=Math.min(100,h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%'},{passive:true});`;

const html = (body, status = 200, extra = {}) => new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300', ...extra } });
const notFound = () => html(page({ title: 'Página no encontrada', path: '/404/', noindex: true, body: '<section class="wrap hero"><span class="eyebrow">● Error 404</span><h1>Esta página <span>no existe</span>.</h1><p>Quizás el artículo cambió de dirección. Vuelve al inicio para ver todas las guías.</p><a class="btn" href="/">Ir al inicio →</a></section>' }), 404);

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    let p = u.pathname;
    if (u.hostname.startsWith('www.')) return Response.redirect(SITE + p, 301);
    if (p === '/style.css') return new Response(env.CSS || await env.POSTS.get('asset:style.css'), { headers: { 'content-type': 'text/css; charset=utf-8', 'cache-control': 'public, max-age=86400' } });
    if (p === '/app.js') return new Response(CLIENT_JS, { headers: { 'content-type': 'application/javascript', 'cache-control': 'public, max-age=86400' } });
    if (p === '/favicon.svg') return new Response(FAVICON, { headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=604800' } });
    let im;
    if ((im = p.match(/^\/img\/([a-z0-9-]+)\.jpg$/))) {
      const b = await env.POSTS.get('img:' + im[1], 'arrayBuffer');
      return b ? new Response(b, { headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=2592000' } }) : new Response('not found', { status: 404 });
    }
    if (p === '/robots.txt') return new Response(`User-agent: *\nAllow: /\nDisallow: /previa/\n\nSitemap: ${SITE}/sitemap.xml\n`, { headers: { 'content-type': 'text/plain' } });
    if (p === '/ads.txt') { const ads = await env.POSTS.get('asset:ads.txt'); return ads ? new Response(ads, { headers: { 'content-type': 'text/plain' } }) : notFound(); }
    if (!p.endsWith('/') && !p.includes('.')) return Response.redirect(u.origin + p + '/' + u.search, 301);

    const posts = await allPosts(env);
    const live = posts.filter(isLive);

    if (p === '/sitemap.xml') {
      const urls = ['/', ...Object.keys(STATIC).map((k) => `/${k}/`), ...Object.keys(CATS).filter((c) => live.some((x) => x.category === c)).map((c) => `/tema/${c}/`)]
        .map((x) => `<url><loc>${SITE}${x}</loc></url>`).concat(live.map((x) => `<url><loc>${SITE}/${x.slug}/</loc><lastmod>${x.updatedDate || x.pubDate}</lastmod></url>`));
      return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
    }
    if (p === '/rss.xml') {
      const items = live.slice(0, 30).map((x) => `<item><title>${esc(x.title)}</title><link>${SITE}/${x.slug}/</link><guid>${SITE}/${x.slug}/</guid><description>${esc(x.description)}</description><pubDate>${new Date(x.pubDate + 'T12:00:00Z').toUTCString()}</pubDate></item>`).join('');
      return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${NAME}</title><link>${SITE}/</link><description>${esc(DESC)}</description><language>es</language>${items}</channel></rss>`, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
    }
    if (p === '/') {
      const [first, ...rest] = live;
      const schema = [{ '@context': 'https://schema.org', '@type': 'WebSite', name: NAME, url: SITE + '/', inLanguage: 'es', description: DESC }];
      return html(page({ title: NAME, path: '/', schema, body: `<section class="wrap hero"><span class="eyebrow">● Bienestar masculino · basado en evidencia</span><h1>Entiende tu cuerpo. <span>Toma el control.</span></h1><p>Guías claras sobre control, ansiedad de desempeño, erección y hábitos. Sin juicios, sin vergüenza y sin promesas milagrosas.</p><a class="btn" href="${CTA}?utm_source=blog&utm_medium=hero&utm_campaign=organico">Haz el test discreto de 2 min →</a></section>
<section class="wrap"><div class="chips">${Object.entries(CATS).map(([k, c]) => `<a class="chip" href="/tema/${k}/">${c[0]}</a>`).join('')}</div>
${live.length ? `<div class="grid">${first ? card(first, true) : ''}${rest.map((x) => card(x)).join('')}</div>` : '<p class="muted">Las primeras guías se publican muy pronto.</p>'}</section>` }));
    }
    let m;
    if ((m = p.match(/^\/tema\/([a-z]+)\/$/)) && CATS[m[1]]) {
      const c = CATS[m[1]]; const list = live.filter((x) => x.category === m[1]);
      return html(page({ title: c[0], description: c[1], path: p, noindex: !list.length, body: `<section class="wrap hero"><span class="eyebrow">● Tema</span><h1>${c[0]}</h1><p>${c[1]}</p></section><section class="wrap">${list.length ? `<div class="grid">${list.map((x) => card(x)).join('')}</div>` : '<p>Pronto publicaremos guías sobre este tema.</p>'}</section>` }));
    }
    if ((m = p.match(/^\/([a-z-]+)\/$/)) && STATIC[m[1]]) {
      const [t, d, b] = STATIC[m[1]];
      return html(page({ title: t, description: d, path: p, body: `<article class="read page prose"><h1>${t}</h1>${b}</article>` }));
    }
    if (p === '/previa/') {
      const drafts = posts.filter((x) => !isLive(x)).sort((a, b) => (a.pubDate > b.pubDate ? 1 : -1));
      return html(page({ title: 'Rascunhos', path: p, noindex: true, body: `<section class="wrap page"><h1>Fila de rascunhos</h1><p>Posts esperando aprovação. Esta página não aparece no Google.</p>${drafts.length ? `<ul>${drafts.map((x) => `<li><a href="/previa/${x.slug}/">${esc(x.title)}</a> — ${fmtDate(x.pubDate)}</li>`).join('')}</ul>` : '<p>Nenhum rascunho no momento.</p>'}</section>` }), 200, { 'x-robots-tag': 'noindex', 'cache-control': 'no-store' });
    }
    if ((m = p.match(/^\/previa\/([a-z0-9-]+)\/$/))) {
      const post = await getPost(env, m[1]);
      if (!post) return notFound();
      return html(await postPage(env, post, m[1], true), 200, { 'x-robots-tag': 'noindex', 'cache-control': 'no-store' });
    }
    if ((m = p.match(/^\/([a-z0-9-]+)\/$/))) {
      const meta = live.find((x) => x.slug === m[1]);
      if (!meta) return notFound();
      const post = await getPost(env, m[1]);
      return html(await postPage(env, post, m[1], false));
    }
    return notFound();
  },
};
