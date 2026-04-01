// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://synclet-io.github.io',
  base: '/synclet-site',
  integrations: [
    starlight({
      title: 'Synclet Docs',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/synclet-io/synclet' },
      ],
      customCss: ['./src/styles/starlight.css'],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'docs/getting-started/introduction' },
            { label: 'Installation', slug: 'docs/getting-started/installation' },
            { label: 'Configuration', slug: 'docs/getting-started/configuration' },
            { label: 'Quick Start', slug: 'docs/getting-started/quick-start' },
          ],
        },
        {
          label: 'Concepts',
          items: [
            { label: 'Architecture', slug: 'docs/concepts/architecture' },
            { label: 'Connectors', slug: 'docs/concepts/connectors' },
            { label: 'Sync Modes', slug: 'docs/concepts/sync-modes' },
            { label: 'Workspaces & Roles', slug: 'docs/concepts/workspaces-and-roles' },
          ],
        },
        {
          label: 'User Guide',
          items: [
            { label: 'Authentication', slug: 'docs/guides/authentication' },
            { label: 'Sources', slug: 'docs/guides/sources' },
            { label: 'Destinations', slug: 'docs/guides/destinations' },
            { label: 'Connections', slug: 'docs/guides/connections' },
            { label: 'Stream Configuration', slug: 'docs/guides/stream-configuration' },
            { label: 'Scheduling', slug: 'docs/guides/scheduling' },
            { label: 'Monitoring', slug: 'docs/guides/monitoring' },
            { label: 'Notifications', slug: 'docs/guides/notifications' },
            { label: 'Settings', slug: 'docs/guides/settings' },
          ],
        },
        {
          label: 'Deployment',
          items: [
            { label: 'Docker', slug: 'docs/deployment/docker' },
            { label: 'Kubernetes', slug: 'docs/deployment/kubernetes' },
            { label: 'Production', slug: 'docs/deployment/production' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'CLI', slug: 'docs/reference/cli' },
            { label: 'Environment Variables', slug: 'docs/reference/environment-variables' },
            { label: 'Troubleshooting', slug: 'docs/reference/troubleshooting' },
            { label: 'FAQ', slug: 'docs/reference/faq' },
          ],
        },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});