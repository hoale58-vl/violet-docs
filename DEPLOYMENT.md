# Deployment Guide - GitHub Pages

This guide will help you deploy your Docusaurus site to GitHub Pages.

## 📋 Prerequisites

- GitHub account (username: **violet**)
- Git installed locally
- Repository name: **violet-docs**

## 🚀 Deployment Options

### Option 1: Using GitHub CLI (Recommended)

#### Step 1: Authenticate with GitHub
```bash
gh auth login
```
Follow the prompts to authenticate.

#### Step 2: Create Repository
```bash
gh repo create violet-docs --public --source=. --remote=origin --push
```

This will:
- Create a public repository called `violet-docs`
- Add it as the `origin` remote
- Push your code to GitHub

#### Step 3: Enable GitHub Pages
```bash
gh repo edit --enable-pages --pages-branch gh-pages
```

Or manually in the GitHub repository:
1. Go to **Settings** → **Pages**
2. Under **Build and deployment**, select **GitHub Actions** as the source
3. Save

---

### Option 2: Using GitHub Web Interface

#### Step 1: Create Repository on GitHub
1. Go to https://github.com/new
2. Repository name: **violet-docs**
3. Description: "Personal tech knowledge base built with Docusaurus"
4. Choose **Public** (required for free GitHub Pages)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

#### Step 2: Push Your Code
```bash
git remote add origin https://github.com/violet/violet-docs.git
git branch -M main
git push -u origin main
```

#### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Build and deployment**:
   - Source: Select **GitHub Actions**
4. The GitHub Actions workflow will automatically deploy your site

---

## 📊 Monitoring Deployment

### Check GitHub Actions Status
```bash
gh run list
```

Or visit: https://github.com/violet/violet-docs/actions

### View Your Deployed Site

Once deployed, your site will be available at:
```
https://violet.github.io/violet-docs/
```

---

## 🔄 Updating Your Site

After initial deployment, updates are automatic:

1. Make changes to your docs
2. Commit and push:
   ```bash
   git add .
   git commit -m "Update content"
   git push
   ```
3. GitHub Actions will automatically rebuild and deploy

---

## 🛠️ Manual Deployment (Alternative)

If you prefer manual deployment without GitHub Actions:

```bash
# Build the site
npm run build

# Deploy using Docusaurus CLI
GIT_USER=violet npm run deploy
```

This will:
- Build your site
- Push to the `gh-pages` branch
- Deploy to GitHub Pages

---

## 🐛 Troubleshooting

### Build Fails
- Check the Actions tab for error messages
- Ensure all dependencies are in `package.json`
- Try building locally: `npm run build`

### 404 Error on Deployment
- Ensure GitHub Pages is enabled
- Check that source is set to **GitHub Actions**
- Wait 2-5 minutes for deployment to complete

### Broken Links or Images
- Verify `baseUrl` in `docusaurus.config.ts` is `/violet-docs/`
- Clear cache and rebuild: `npm run clear && npm run build`

---

## 📚 Resources

- [Docusaurus Deployment Docs](https://docusaurus.io/docs/deployment)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Your site is configured and ready to deploy!** 🎉

Choose your preferred deployment method above and follow the steps.
