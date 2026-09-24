import { defineConfig } from 'astro/config';
import remarkGfm from 'remark-gfm';
import remarkRecoverStrong from './src/plugins/remark-recover-strong.mjs';

export default defineConfig({
  site: 'https://myweb.ganlei.com',
  markdown: {
    remarkPlugins: [remarkGfm, remarkRecoverStrong]
  }
});
