import rss from '@astrojs/rss';
import { SITE_NAME, SITE_DESCRIPTION } from '../consts';
import { getPublishedPosts } from '../utils';

export async function GET(context) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: `/${p.id}/`,
    })),
  });
}
