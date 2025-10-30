# Violet's Tech Knowledge Base

A personal knowledge base for documenting best practices, experiences, and learnings across various technology domains.

Built with [Docusaurus](https://docusaurus.io/), featuring beautiful documentation, live code playgrounds, and powerful search.

## Features

- **18 Technology Categories** - DevOps, Backend, Frontend, Blockchain, AI/ML, and more
- **Live Code Playground** - Interactive code examples you can edit and run
- **Powerful Search** - Find information quickly
- **Dark Mode** - Built-in dark/light theme support
- **Responsive Design** - Works great on all devices
- **Easy to Edit** - Just add markdown files and commit
- **Syntax Highlighting** - Support for 20+ programming languages

## Quick Start

### Installation

```bash
npm install
```

### Local Development

```bash
npm start
```

This starts a local development server at `http://localhost:3000` and opens your browser. Most changes are reflected live without restarting the server.

### Build for Production

```bash
npm run build
```

Generates static content into the `build` directory that can be served by any static hosting service.

## How to Add Content

### 1. Create a New Document

Add a markdown file to any category folder:

```bash
docs/
├── devops/
│   ├── intro.md
│   └── your-new-file.md    # Add your content here
├── backend/
├── frontend/
└── ...
```

### 2. Markdown Format

```markdown
# Title of Your Document

Brief description...

## Section 1

Your content here...

### Code Example

\`\`\`javascript
const example = "Hello World";
console.log(example);
\`\`\`

## Tags

\`tag1\`, \`tag2\`, \`tag3\`

---

*Last updated: 2025-10-30*
```

### 3. Live Code Playground (Interactive)

For React examples, use `live` in the code fence:

```markdown
\`\`\`jsx live
function MyComponent() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`
```

The code above will be **editable and runnable** in the browser!

### 4. Organize Content

The sidebar is auto-generated from your folder structure. Create subdirectories to organize:

```
docs/
├── devops/
│   ├── intro.md
│   ├── docker/
│   │   ├── basics.md
│   │   └── advanced.md
│   └── kubernetes/
│       └── deployment.md
```

## Available Categories

### Core Development
- **devops** - CI/CD, Infrastructure, Deployment
- **backend** - Server-side development, APIs
- **frontend** - UI/UX, React, Vue, Angular
- **mobile** - iOS, Android, React Native

### Specialized Domains
- **blockchain** - Smart contracts, Web3
- **ai-ml** - Machine Learning, AI models
- **database** - SQL, NoSQL, Optimization
- **games** - Game development

### Engineering Excellence
- **security** - Security best practices
- **testing** - Testing strategies
- **architecture** - System design
- **performance** - Optimization
- **networking** - Protocols, APIs
- **cloud** - AWS, GCP, Azure, Kubernetes

### Tools & Resources
- **tools** - Development tools, IDEs
- **design** - UI/UX, Design systems
- **websites** - Useful resources
- **projects** - Portfolio showcase

## Customization

### Update Site Title

Edit `docusaurus.config.ts`:

```typescript
title: 'Your Title',
tagline: 'Your tagline',
```

### Modify Navigation

Edit `docusaurus.config.ts` navbar section to add custom links.

### Add More Languages

Edit the `prism.additionalLanguages` array in `docusaurus.config.ts`.

## Deployment Options

### GitHub Pages

```bash
npm run deploy
```

### Netlify

1. Connect your GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `build`

### Vercel

```bash
vercel
```

### Other Platforms

The `build` folder can be served by any static hosting service (AWS S3, Cloudflare Pages, etc.)

## Tips

1. **Use Tags** - Add tags at the bottom of each document for better organization
2. **Include Examples** - Code examples make content more valuable
3. **Update Dates** - Keep track of when content was last updated
4. **Link Between Docs** - Use relative links to connect related content
5. **Add Images** - Place images in `static/img/` and reference them with `/img/your-image.png`
6. **Write Regularly** - The more you add, the more valuable your knowledge base becomes

## Useful Commands

```bash
npm start              # Start dev server
npm run build          # Build for production
npm run serve          # Preview production build locally
npm run clear          # Clear cache
npm run write-translations  # Extract translations
```

## Resources

- [Docusaurus Documentation](https://docusaurus.io/)
- [Markdown Guide](https://www.markdownguide.org/)
- [MDX Documentation](https://mdxjs.com/)

---

**Happy documenting!** 📚✨
