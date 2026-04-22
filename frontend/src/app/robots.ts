import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/auth/', '/results/'],
    },
    sitemap: 'https://lynce.io/sitemap.xml',
  };
}
