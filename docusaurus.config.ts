import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Violet\'s Tech Knowledge Base',
  tagline: 'Best practices, experiences, and learnings across technology domains',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://violet.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/violet-docs/',

  // GitHub pages deployment config.
  organizationName: 'violet', // Your GitHub org/user name.
  projectName: 'violet-docs', // Your repo name.

  onBrokenLinks: 'throw',

  // Deployment branch
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Removed editUrl for personal knowledge base
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Removed editUrl for personal knowledge base
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: ['@docusaurus/theme-live-codeblock'],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Violet\'s Docs',
      logo: {
        alt: 'Violet Docs Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '📚 Knowledge Base',
        },
        {
          type: 'search',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Categories',
          items: [
            {
              label: 'DevOps',
              to: '/docs/devops/intro',
            },
            {
              label: 'Backend',
              to: '/docs/backend/intro',
            },
            {
              label: 'Frontend',
              to: '/docs/frontend/intro',
            },
            {
              label: 'Mobile',
              to: '/docs/mobile/intro',
            },
          ],
        },
        {
          title: 'More Topics',
          items: [
            {
              label: 'AI & Machine Learning',
              to: '/docs/ai-ml/intro',
            },
            {
              label: 'Blockchain',
              to: '/docs/blockchain/intro',
            },
            {
              label: 'Security',
              to: '/docs/security/intro',
            },
            {
              label: 'Architecture',
              to: '/docs/architecture/intro',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Projects',
              to: '/docs/projects/intro',
            },
            {
              label: 'Useful Websites',
              to: '/docs/websites/intro',
            },
            {
              label: 'Tools',
              to: '/docs/tools/intro',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Violet. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        'bash',
        'docker',
        'yaml',
        'json',
        'typescript',
        'javascript',
        'python',
        'java',
        'go',
        'rust',
        'cpp',
        'csharp',
        'php',
        'ruby',
        'swift',
        'kotlin',
        'dart',
        'sql',
        'graphql',
        'solidity',
      ],
    },
    algolia: {
      // You'll need to set this up later for search functionality
      // For now, we'll use the default search
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'YOUR_INDEX_NAME',
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
