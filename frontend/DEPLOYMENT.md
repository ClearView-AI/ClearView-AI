# 🚀 Deployment Guide

## Vercel Deployment (Recommended)

### Option 1: Vercel CLI

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy from project root**
```bash
cd /Users/goliveira/Developer/Projects/ClearView/ClearView-AI/frontend
vercel
```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? (Select your account)
   - Link to existing project? `N`
   - What's your project's name? `clearview-ai`
   - In which directory is your code located? `./`
   - Want to override the settings? `N`

5. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add: `VITE_API_URL` with your backend URL

6. **Production deployment:**
```bash
vercel --prod
```

### Option 2: Vercel GitHub Integration (Automatic)

1. **Push your code to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: `Vite`
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Environment Variables:**
   - Add `VITE_API_URL` with your backend API URL

4. **Deploy:**
   - Click "Deploy"
   - Every push to `main` will trigger automatic deployment

---

## Alternative: Netlify

1. **Install Netlify CLI:**
```bash
npm i -g netlify-cli
```

2. **Build the project:**
```bash
npm run build
```

3. **Deploy:**
```bash
netlify deploy
```

4. **For production:**
```bash
netlify deploy --prod
```

---

## Alternative: AWS S3 + CloudFront

1. **Build the project:**
```bash
npm run build
```

2. **Install AWS CLI:**
```bash
brew install awscli
aws configure
```

3. **Create S3 bucket:**
```bash
aws s3 mb s3://clearview-ai-frontend
```

4. **Upload build files:**
```bash
aws s3 sync dist/ s3://clearview-ai-frontend
```

5. **Enable static website hosting:**
```bash
aws s3 website s3://clearview-ai-frontend --index-document index.html
```

6. **Set up CloudFront distribution** (optional for CDN)

---

## Backend Connection

### For Production Deployment:

Make sure your backend is deployed and accessible. Update the `VITE_API_URL` environment variable to point to your production backend.

**Example:**
```env
VITE_API_URL=https://your-backend.herokuapp.com
```

### CORS Configuration

Ensure your backend allows requests from your frontend domain:

```javascript
// Backend CORS config
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://clearview-ai.vercel.app',
    'https://your-custom-domain.com'
  ]
}));
```

---

## Custom Domain Setup (Vercel)

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records with your domain provider
5. Wait for DNS propagation (can take up to 48 hours)

---

## Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Backend API is accessible
- [ ] CORS configured on backend
- [ ] Build runs successfully (`npm run build`)
- [ ] No console errors in production build
- [ ] All API endpoints tested
- [ ] Analytics/monitoring set up (optional)
- [ ] Error tracking configured (Sentry, etc.) (optional)

---

## Testing Production Build Locally

```bash
npm run build
npm run preview
```

Open `http://localhost:4173` to test the production build locally.

---

## Troubleshooting

### Issue: API calls failing in production
**Solution:** Check CORS settings and ensure `VITE_API_URL` is set correctly

### Issue: Environment variables not working
**Solution:** Make sure variables start with `VITE_` prefix and rebuild after changes

### Issue: 404 on page refresh
**Solution:** Configure `vercel.json` rewrites (already included in the project)

### Issue: Build fails
**Solution:** Run `npm run build` locally to see detailed error messages

---

## Monitoring & Analytics

Consider adding:
- **Vercel Analytics** (built-in, just enable in dashboard)
- **Google Analytics**
- **Sentry** for error tracking
- **LogRocket** for session replay

---

## Performance Optimization

Before deploying:
1. Optimize images (use WebP format)
2. Enable code splitting (already configured with Vite)
3. Lazy load components if needed
4. Enable Vercel's Edge Network (automatic)
5. Set up CDN for static assets

---

Need help? Check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

