# Complete Installation & Setup Guide

## Overview

This guide walks you through setting up the entire Mentor Bridge Bloom platform:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: NestJS + TypeScript + TypeORM + PostgreSQL + Redis

## Prerequisites

- Node.js 18.x or higher
- PostgreSQL 12 or higher
- Redis 6 or higher
- npm or yarn package manager
- Git

## Step 1: Backend Setup

### 1.1 Install Dependencies

```bash
cd backend
npm install
```

Key packages installed:
- `@nestjs/core`, `@nestjs/common` - NestJS framework
- `typeorm`, `pg` - Database ORM and PostgreSQL driver
- `ioredis` - Redis client
- `@nestjs/jwt`, `passport` - Authentication
- `bcrypt` - Password hashing
- `multer`, `sharp` - File upload and image processing
- `socket.io` - WebSocket support

### 1.2 Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

**Important environment variables:**

```env
NODE_ENV=development
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=mentor_bridge_bloom

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRATION=24h

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 1.3 Database Setup

```bash
# Create PostgreSQL database
createdb mentor_bridge_bloom

# Run migrations (auto-generated from entities)
npm run migration:run

# Optional: Seed sample data
npm run seed
```

### 1.4 Start Backend Server

```bash
# Development mode with auto-reload
npm run start:dev

# Production build
npm run build
npm run start:prod
```

Server will run on `http://localhost:3000`

## Step 2: Frontend Setup

### 2.1 Install Dependencies

```bash
cd ..
npm install
```

Key packages installed:
- React 18.3.1 + React DOM
- TypeScript 5.8.3
- Vite 5.4.19 - Build tool
- Tailwind CSS 3.4.17 - Styling
- shadcn/ui - Component library
- React Router 6.30.1 - Routing
- React Query 5.83.0 - Data fetching
- Axios 1.6.5 - HTTP client
- Recharts 2.15.4 - Charts
- Socket.io client 4.7.2 - WebSocket client

### 2.2 Configure Environment

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### 2.3 Start Frontend Development Server

```bash
npm run dev
```

App will run on `http://localhost:5173`

## Step 3: Verify Installation

### 3.1 Test Backend

```bash
# Test API
curl http://localhost:3000/api/auth/status

# Check health
curl http://localhost:3000/health
```

### 3.2 Test Frontend

Open http://localhost:5173 in your browser

### 3.3 Test Database Connection

```bash
# Connect to PostgreSQL
psql -h localhost -U postgres -d mentor_bridge_bloom

# Verify tables
\dt
```

### 3.4 Test Redis Connection

```bash
# Connect to Redis
redis-cli

# Test connection
ping
```

## Complete Feature List Implemented

### ✅ Authentication System
- User registration with role selection (Student, Alumni, Admin)
- JWT-based login/logout
- Token refresh mechanism
- Email verification (framework ready)
- Password reset flow
- 2FA support (framework ready)

### ✅ User Profiles
- Complete profile CRUD operations
- Profile photo upload with image optimization
- Skills management
- Work experience and education details
- Professional links (LinkedIn, GitHub, Portfolio)
- Profile visibility settings

### ✅ Messaging System
- Real-time messaging with WebSockets
- Message delivery status tracking (sent, delivered, read)
- Conversation history
- Read receipts
- Delete messages
- Typing indicators (framework ready)

### ✅ Connection System
- Send/receive connection requests
- Accept/reject connections
- View connections list
- Mentorship matching
- Block/unblock users
- Connection statistics

### ✅ Alumni Directory
- Advanced search with multiple filters:
  - Keyword search (name, bio, headline)
  - Skills filtering
  - Company filtering
  - Location filtering
  - Graduation year filtering
  - Industry filtering
  - Mentorship availability filter
- Sorting options (name, date joined, graduation year)
- Pagination with configurable page size
- Profile preview cards

### ✅ Admin Analytics Dashboard
- **User Statistics**
  - Total users by role and status
  - New user registrations
  - User retention rates
  - Active vs inactive users
  
- **Engagement Metrics**
  - Total messages sent
  - Connection statistics
  - Profile completeness ratio
  - Daily/weekly/monthly trends
  
- **Platform Health**
  - System uptime
  - API response times
  - Error rates
  - Database performance
  
- **Advanced Filtering**
  - Date range filtering (7/30/90 days)
  - User role filtering
  - Status-based filtering
  - Custom report generation
  - CSV and PDF export

### ✅ Performance Optimizations
- Redis caching for frequently accessed data
- Database query optimization with indexes
- Pagination for large datasets
- Image optimization and compression
- Connection pooling
- API response compression
- Lazy loading support

### ✅ Security Features
- Password hashing with bcrypt
- JWT token-based authentication
- CORS configuration
- Helmet.js for HTTP headers
- SQL injection prevention (ORM)
- XSS protection
- HTTPS ready for production

## Troubleshooting

### Common Issues

**1. PostgreSQL Connection Error**
```bash
# Ensure PostgreSQL is running
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: Check Services in Control Panel

# Verify credentials in .env
# Test connection:
psql -h localhost -U postgres -d mentor_bridge_bloom
```

**2. Redis Connection Error**
```bash
# Start Redis
# macOS: redis-server
# Linux: sudo service redis-server start
# Windows: Use WSL or Docker

# Test connection:
redis-cli ping
```

**3. Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>

# Or change PORT in .env
```

**4. Module Not Found Error**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**5. TypeScript Errors**
```bash
# Rebuild TypeScript
npm run build

# Check tsconfig.json
```

## Development Workflow

### Starting Development Environment

**Terminal 1 - Backend**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend**
```bash
npm run dev
```

**Terminal 3 - Database (optional if not running as service)**
```bash
psql -h localhost -U postgres -d mentor_bridge_bloom
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/alumni-directory

# Make changes and commit
git add .
git commit -m "feat: add alumni directory with filters"

# Push to origin
git push origin feature/alumni-directory

# Create pull request
```

## Building for Production

### Backend Build
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend Build
```bash
npm run build
npm run preview
```

## Deployment Options

### Backend Deployment
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **DigitalOcean**: App Platform or Droplet
- **AWS**: EC2 or Elastic Beanstalk

### Frontend Deployment
- **Vercel**: Deploy from GitHub (recommended for Next.js/Vite)
- **Netlify**: Connect GitHub repo
- **GitHub Pages**: Static hosting
- **AWS S3 + CloudFront**: CDN distribution

### Database Deployment
- **AWS RDS**: Managed PostgreSQL
- **DigitalOcean**: Managed Database
- **Azure Database**: PostgreSQL Server
- **Self-hosted**: EC2 + PostgreSQL

### Redis Deployment
- **AWS ElastiCache**: Managed Redis
- **DigitalOcean**: Managed Redis
- **Self-hosted**: EC2 + Redis

## Production Checklist

- [ ] Update JWT_SECRET to a strong random value
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Enable Redis persistence
- [ ] Configure email service for notifications
- [ ] Set up monitoring and logging
- [ ] Configure CDN for static assets
- [ ] Set up health checks
- [ ] Enable rate limiting
- [ ] Configure error tracking (Sentry)
- [ ] Set up performance monitoring (New Relic)

## Documentation

- API Documentation: `http://localhost:3000/api/docs` (Swagger)
- Backend: See `BACKEND_SETUP.md`
- Frontend: See `README.md`

## Support & Issues

For issues:
1. Check this guide
2. Review error messages
3. Check logs: `docker logs` or `npm logs`
4. Search GitHub issues
5. Contact development team

## Next Steps

1. **Register test users** (Student, Alumni, Admin roles)
2. **Complete profiles** with photos and skills
3. **Test messaging** between users
4. **Explore analytics** dashboard
5. **Test search filters** in alumni directory
6. **Verify file uploads** and image optimization

## Version Information

- Node.js: 18.x or higher
- npm: 9.x or higher
- PostgreSQL: 12+
- Redis: 6+
- NestJS: 10.3.3
- React: 18.3.1
- TypeScript: 5.8.3

---

**Last Updated**: November 14, 2025
**Status**: Production Ready
