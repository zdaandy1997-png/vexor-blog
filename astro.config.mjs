import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://blog.vexorhealth.com',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      // As prévias de rascunho nunca entram no sitemap
      filter: (page) => !page.includes('/previa/'),
    }),
  ],
});
