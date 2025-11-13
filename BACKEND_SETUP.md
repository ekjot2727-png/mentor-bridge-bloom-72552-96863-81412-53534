# Mentor Bridge Bloom - Complete Backend & Frontend Setup Guide

## Project Overview

This is a comprehensive alumni networking platform with:
- NestJS backend with TypeScript
- PostgreSQL database
- Redis caching
- Real-time messaging with WebSockets
- Comprehensive analytics
- JWT authentication
- Profile management with photo uploads
- Alumni directory with advanced filtering
- Admin dashboard with extensive analytics

## Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 12
- Redis >= 6
- npm or yarn

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your database and Redis credentials
npm run start:dev
```

### 2. Database Setup

```bash
# Create database
createdb mentor_bridge_bloom

# Run migrations (will be auto-generated from entities)
npm run migration:run
```

### 3. Frontend Setup

```bash
cd ..
npm install
npm run dev
```

## Project Structure

### Backend (`/backend`)

```
backend/
├── src/
│   ├── config/              # Configuration files
│   ├── database/
│   │   ├── entities/        # TypeORM entities
│   │   ├── migrations/      # Database migrations
│   │   └── seeders/         # Sample data
│   ├── modules/
│   │   ├── auth/            # Authentication (JWT, Register, Login)
│   │   ├── users/           # User management
│   │   ├── profiles/        # Profile CRUD & photo upload
│   │   ├── messages/        # Messaging system
│   │   ├── connections/     # Connection requests & mentorship
│   │   ├── analytics/       # Admin analytics & reporting
│   │   ├── jobs/            # Job postings
│   │   └── events/          # Events management
│   ├── common/
│   │   ├── services/        # Shared services (Cache, etc.)
│   │   ├── guards/          # Auth guards
│   │   ├── interceptors/    # Request/response interceptors
│   │   ├── pipes/           # Validation pipes
│   │   └── decorators/      # Custom decorators
│   ├── websockets/          # WebSocket gateway for real-time features
│   └── main.ts              # Application entry point
├── package.json
├── tsconfig.json
└── .env.example
```

### Frontend (`/src`)

```
src/
├── pages/
│   ├── admin/               # Admin portal pages
│   │   ├── Analytics.tsx    # Comprehensive analytics
│   │   ├── UserManagement.tsx
│   │   └── ...
│   ├── student/             # Student portal pages
│   │   ├── Profile.tsx
│   │   ├── FindAlumni.tsx
│   │   └── ...
│   ├── alumni/              # Alumni portal pages
│   │   ├── Profile.tsx
│   │   ├── Directory.tsx
│   │   └── ...
│   └── ...
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── ...
├── hooks/                   # Custom React hooks
├── lib/
│   ├── api.ts               # API client (Axios)
│   ├── utils.ts             # Utilities
│   └── ...
└── ...
```

## Key Features Implemented

### Authentication
- JWT-based authentication
- Separate roles: Admin, Student, Alumni
- Email verification
- Password reset
- 2FA support (optional)

### Profile Management
- Edit profile information
- Upload and crop profile photos
- Skills and expertise management
- Resume/portfolio links
- Search optimization

### Messaging System
- Real-time WebSocket messaging
- Message delivery status tracking
- Read receipts
- Message history
- Typing indicators

### Connections & Mentorship
- Connection requests
- Accept/reject connections
- Mentorship matching
- Mentee-mentor relationships

### Alumni Directory
- Advanced search filters:
  - By skills
  - By company
  - By location
  - By graduation year
  - By industry
  - By expertise
- Pagination and sorting
- Profile view analytics

### Admin Dashboard Analytics
- **User Statistics**
  - Total users by role
  - Active vs inactive users
  - New user registrations (by date range)
  - User retention rate
  
- **Engagement Metrics**
  - Messages sent (daily, weekly, monthly)
  - Connections made
  - Profile completeness ratio
  - Login activity
  
- **Platform Health**
  - System uptime
  - API response times
  - Error rates
  - Database query performance
  
- **Advanced Filters**
  - Date range filtering
  - User role filtering
  - Status filtering
  - Export to CSV/PDF
  - Real-time dashboard updates

### Performance Optimizations
- Redis caching for frequently accessed data
- Database query optimization with indexes
- Pagination for large datasets
- Lazy loading of profile photos
- API response compression
- Database connection pooling

## API Endpoints

### Auth Module
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout user
POST   /api/auth/refresh-token     - Refresh JWT token
POST   /api/auth/forgot-password   - Initiate password reset
POST   /api/auth/reset-password    - Complete password reset
POST   /api/auth/verify-email      - Verify email address
```

### Users Module
```
GET    /api/users/:id              - Get user details
PATCH  /api/users/:id              - Update user info
DELETE /api/users/:id              - Delete user account
GET    /api/users                  - List users (admin only)
```

### Profiles Module
```
GET    /api/profiles/:id           - Get user profile
PATCH  /api/profiles/:id           - Update profile
POST   /api/profiles/:id/photo     - Upload profile photo
DELETE /api/profiles/:id/photo     - Delete profile photo
GET    /api/profiles/alumni/search - Search alumni with filters
  Query params:
    - skills (comma separated)
    - company
    - location
    - graduationYear
    - industry
    - keyword
    - page
    - limit
    - sortBy
    - order (asc/desc)
```

### Messages Module
```
POST   /api/messages               - Send message
GET    /api/messages/:userId       - Get conversation history
GET    /api/messages               - Get all conversations
PATCH  /api/messages/:id           - Mark as read
DELETE /api/messages/:id           - Delete message
WebSocket: /socket.io              - Real-time messaging
```

### Connections Module
```
POST   /api/connections            - Send connection request
PATCH  /api/connections/:id        - Accept/reject request
GET    /api/connections/:id        - Get connection status
GET    /api/connections            - Get all connections
DELETE /api/connections/:id        - Remove connection
GET    /api/connections/pending    - Get pending requests
```

### Analytics Module (Admin)
```
GET    /api/analytics/users        - User statistics
GET    /api/analytics/engagement   - Engagement metrics
GET    /api/analytics/platform     - Platform health
GET    /api/analytics/connections  - Connection statistics
GET    /api/analytics/messages     - Messaging statistics
GET    /api/analytics/report       - Generate custom reports
POST   /api/analytics/export       - Export data (CSV/PDF)
```

### Jobs Module
```
GET    /api/jobs                   - List jobs
GET    /api/jobs/:id               - Get job details
POST   /api/jobs                   - Post job (alumni)
PATCH  /api/jobs/:id               - Update job posting
DELETE /api/jobs/:id               - Delete job posting
POST   /api/jobs/:id/apply         - Apply for job
```

### Events Module
```
GET    /api/events                 - List events
GET    /api/events/:id             - Get event details
POST   /api/events                 - Create event (admin)
PATCH  /api/events/:id             - Update event
DELETE /api/events/:id             - Delete event
POST   /api/events/:id/register    - Register for event
GET    /api/events/:id/attendees   - Get attendees list
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mentor_bridge_bloom
DB_LOGGING=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=7d

# File Upload
FILE_UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-password
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Running the Application

### Development Mode

**Terminal 1 - Backend**
```bash
cd backend
npm run start:dev
# Server runs on http://localhost:3000
```

**Terminal 2 - Frontend**
```bash
npm run dev
# App runs on http://localhost:5173
```

**Terminal 3 - PostgreSQL** (if not running as service)
```bash
# Ensure PostgreSQL is running
```

**Terminal 4 - Redis** (if not running as service)
```bash
# Ensure Redis is running
redis-server
```

### Production Build

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
npm run build
npm run preview
```

## Testing

### Backend Tests
```bash
cd backend
npm run test                # Run all tests
npm run test:watch        # Watch mode
npm run test:cov          # Coverage report
npm run test:e2e          # End-to-end tests
```

### Frontend Tests (optional)
```bash
npm run test              # Run tests
npm run test:watch      # Watch mode
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD in .env
- Verify database exists: `createdb mentor_bridge_bloom`

### Redis Connection Issues
- Ensure Redis is running on configured host/port
- Check Redis password if configured

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

### CORS Issues
- Ensure FRONTEND_URL matches your frontend's origin
- Check CORS configuration in main.ts

## Performance Tips

1. **Database Optimization**
   - Use indexes on frequently queried columns (already done)
   - Regular VACUUM and ANALYZE on PostgreSQL
   - Monitor slow queries using pg_stat_statements

2. **Caching Strategy**
   - Profile data cached for 1 hour
   - User lists cached for 30 minutes
   - Analytics cached for 5 minutes
   - Set custom TTL via cache service

3. **Frontend Optimization**
   - Lazy load components
   - Use React Query for data fetching
   - Implement virtual scrolling for long lists
   - Compress images before upload

## Security Considerations

1. **JWT Tokens**
   - Tokens stored in httpOnly cookies (not localStorage)
   - Refresh tokens have longer expiry
   - Token rotation on refresh

2. **Password Security**
   - BCrypt hashing with salt rounds = 10
   - Password reset tokens expire after 1 hour
   - Enforce strong password requirements

3. **File Upload Security**
   - File type validation
   - Size limits enforced
   - Files stored outside web root
   - Virus scanning (optional integration)

4. **Data Protection**
   - Encryption for sensitive fields
   - HTTPS only in production
   - SQL injection prevention via ORM
   - XSS protection via React's built-in escaping

## Deployment

### Recommended Platforms
- **Backend**: Heroku, DigitalOcean, AWS EC2, Railway
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Database**: AWS RDS, DigitalOcean Managed Database
- **Redis**: AWS ElastiCache, DigitalOcean Managed Redis

### Pre-deployment Checklist
- [ ] Set production environment variables
- [ ] Run database migrations on prod database
- [ ] Update FRONTEND_URL for CORS
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Test all critical workflows

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit pull request
5. Code review and merge

## License

MIT

## Support

For issues, questions, or suggestions, please open an GitHub issue or contact the development team.

---

**Last Updated**: November 14, 2025
**Version**: 1.0.0
