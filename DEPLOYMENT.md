# Malta QR Order - Production Deployment Guide

## Prerequisites

1. **Node.js** v18+ and npm/yarn installed
2. **Supabase** project with all required tables and functions
3. **Domain** configured with SSL
4. **Environment variables** configured

## Environment Setup

1. Copy `env.example` to `.env`:
```bash
cp env.example .env
```

2. Configure all required environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
- `VITE_VAPID_PUBLIC_KEY`: For push notifications
- `VITE_STRIPE_PUBLIC_KEY`: For payment processing

## Supabase Edge Functions Setup

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link your project:
```bash
supabase link --project-ref <your-project-ref>
```

3. Set edge function secrets:
```bash
supabase secrets set OPENAI_API_KEY=<your-key>
supabase secrets set GOOGLE_MAPS_API_KEY=<your-key>
supabase secrets set GEMINI_API_KEY=<your-key>
supabase secrets set PINECONE_API_KEY=<your-key>
supabase secrets set STRIPE_SECRET_KEY=<your-key>
```

4. Deploy edge functions:
```bash
supabase functions deploy
```

## Build & Deploy

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard

### Option 2: Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify

3. Configure environment variables in Netlify dashboard

### Option 3: Traditional Hosting

1. Build for production:
```bash
npm run build
```

2. Upload the `dist` folder to your server

3. Configure nginx/Apache to serve the SPA:

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/malta-qr-order/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test all Supabase edge functions
- [ ] Check PWA installation works
- [ ] Test payment processing
- [ ] Verify push notifications
- [ ] Monitor performance metrics
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics
- [ ] Test on various devices
- [ ] Set up SSL certificate
- [ ] Configure CDN for static assets
- [ ] Set up monitoring alerts

## Performance Optimization

1. **Enable Gzip compression** on your server
2. **Configure HTTP/2** for better performance
3. **Set up CDN** for global distribution
4. **Enable Brotli compression** for better text compression

## Security Checklist

- [ ] All API keys are in environment variables
- [ ] HTTPS is enforced
- [ ] CSP headers are configured
- [ ] Rate limiting is enabled
- [ ] Input validation is working
- [ ] XSS protection is enabled

## Monitoring

1. Set up monitoring for:
   - Server uptime
   - API response times
   - Error rates
   - Core Web Vitals

2. Configure alerts for:
   - High error rates
   - Slow API responses
   - Server downtime
   - Failed payments

## Troubleshooting

### Build fails
- Check Node version (should be 18+)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run lint`

### Edge functions not working
- Verify API keys are set in Supabase
- Check function logs: `supabase functions logs <function-name>`
- Test locally: `supabase functions serve`

### Performance issues
- Check bundle size: `npm run build`
- Review network tab for slow requests
- Use Chrome DevTools Performance tab
- Check Core Web Vitals in PageSpeed Insights 