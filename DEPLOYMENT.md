# Deployment Guide

## Vercel Deployment

### Prerequisites
- Node.js 18+ (specified in `.nvmrc` and `package.json`)
- npm or yarn package manager

### Configuration Files
- `vercel.json` - Vercel deployment configuration
- `.nvmrc` - Node.js version specification
- `.env.production` - Production environment variables

### Build Process
The application uses CRACO (Create React App Configuration Override) for custom webpack configuration:
- Source maps are disabled in production for faster builds
- Code splitting is optimized for better performance
- ESLint warnings are suppressed during build

### Environment Variables
Set these in your Vercel dashboard:
- `GENERATE_SOURCEMAP=false`
- `CI=false`
- `DISABLE_ESLINT_PLUGIN=true`

### Deployment Steps
1. Connect your repository to Vercel
2. Vercel will automatically detect the framework (Create React App)
3. Build command: `npm run build`
4. Output directory: `build`
5. Install command: `npm install`

### Troubleshooting
If deployment fails:
1. Check Node.js version compatibility
2. Verify all dependencies are properly installed
3. Ensure environment variables are set correctly
4. Check build logs for specific error messages

### Performance Optimizations
- Code splitting with vendor chunks
- Disabled source maps in production
- Optimized webpack configuration
- Gzip compression enabled
