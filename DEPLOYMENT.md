# Loop Freight - Deployment Guide

## Vercel Deployment Instructions

### Method 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/loop-freight.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project

3. **Configure Environment Variables**
   In your Vercel project dashboard, add these environment variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database?schema=public
   NEXTAUTH_SECRET=your-random-secret-key-here
   NEXTAUTH_URL=https://your-app-domain.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

### Method 2: Deploy from CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   ```

## Database Setup for Production

### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel project dashboard
2. Navigate to "Storage" tab
3. Create a new Postgres database
4. Connect it to your project
5. The `DATABASE_URL` will be automatically configured

### Option 2: External PostgreSQL Provider
Use services like:
- **Supabase** (free tier available)
- **Railway** (free tier available)
- **Render** (free tier available)
- **PlanetScale** (MySQL compatible)

## Post-Deployment Steps

1. **Run Database Migrations**
   ```bash
   # Connect to your database and run:
   npx prisma migrate deploy
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Seed the Database** (Optional)
   ```bash
   npx prisma db seed
   ```

## Environment Variables Setup

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random string for JWT encryption
- `NEXTAUTH_URL` - Your production domain

### Generating NEXTAUTH_SECRET
```bash
# Generate a random secret
openssl rand -base64 32
```

## Build Configuration

The application includes:
- `vercel.json` - Vercel deployment configuration
- Proper build scripts in `package.json`
- Environment variable configuration
- Automatic Prisma client generation during build

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Ensure all dependencies are installed
   - Check that `DATABASE_URL` is set correctly
   - Verify `NEXTAUTH_SECRET` is not empty

2. **Database Connection Issues**
   - Test connection string locally first
   - Ensure database allows external connections
   - Check firewall settings

3. **Authentication Issues**
   - Verify `NEXTAUTH_URL` matches your domain
   - Ensure `NEXTAUTH_SECRET` is consistent
   - Check that cookies are being set

### Debug Mode
To enable debug logging, add to environment variables:
```
DEBUG=loop-freight:*
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connected and migrated
- [ ] Authentication working
- [ ] All pages loading correctly
- [ ] API routes functioning
- [ ] User roles working properly
- [ ] Database seed data (optional)

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Review application logs
3. Verify environment variables
4. Test database connection
5. Check Next.js build output

## Next Steps After Deployment

1. **Test the Application**
   - Login with provided credentials
   - Create test assignments
   - Verify reassignment workflow
   - Test admin functions

2. **Customize for Production**
   - Update company branding
   - Configure real cities and territories
   - Set up production database
   - Configure monitoring

3. **User Training**
   - Train territory officers
   - Create user documentation
   - Set up support processes

---

Your Loop Freight application is now ready for production! 🚀