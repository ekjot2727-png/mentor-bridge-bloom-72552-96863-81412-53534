# Quick Reference Guide

## 🚀 Getting Started (5 minutes)

### Terminal 1 - Backend
```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
# Runs on http://localhost:3000
```

### Terminal 2 - Frontend  
```bash
npm install
npm run dev
# Runs on http://localhost:5173
```

### Terminal 3 - Database (if needed)
```bash
# Ensure PostgreSQL is running
# Create database
createdb mentor_bridge_bloom
```

---

## 📋 Environment Setup

### Backend .env (critical variables)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mentor_bridge_bloom
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=change-me-to-something-secure
JWT_EXPIRATION=24h
FRONTEND_URL=http://localhost:5173
```

### Frontend .env
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

---

## 🗄️ Database Commands

```bash
# Create database
createdb mentor_bridge_bloom

# Connect to database
psql -h localhost -U postgres -d mentor_bridge_bloom

# Run migrations
cd backend && npm run migration:run

# Reset database (warning: deletes data)
dropdb mentor_bridge_bloom
createdb mentor_bridge_bloom
npm run migration:run
```

---

## 🔑 Key Files & Locations

### Backend Core
- `backend/src/main.ts` - Entry point
- `backend/src/app.module.ts` - Root module
- `backend/src/database/entities/` - Data models
- `backend/src/modules/auth/` - Authentication
- `backend/src/modules/profiles/` - Profiles API
- `backend/src/modules/analytics/` - Analytics

### Frontend Core
- `src/main.tsx` - Entry point
- `src/App.tsx` - Root component
- `src/lib/api-client.ts` - API communication
- `src/pages/` - Page components
- `src/components/` - Reusable components

---

## 🔌 API Quick Links

### Base URL
```
http://localhost:3000/api
```

### Authentication
```bash
# Register
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}

# Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Search Alumni
```bash
GET /profiles/alumni/search?keyword=john&skills=react&company=google&page=1&limit=20
```

### Send Message
```bash
POST /messages
{
  "receiverId": "uuid",
  "content": "Hello!"
}
```

### Get Analytics
```bash
GET /analytics/dashboard?startDate=2025-10-14&endDate=2025-11-14
```

---

## 🔧 Common Tasks

### Create a new module
```bash
cd backend
nest generate module modules/example
nest generate service modules/example
nest generate controller modules/example
```

### Run specific test
```bash
cd backend
npm run test -- auth.service.spec
```

### Build for production
```bash
# Backend
cd backend && npm run build && npm run start:prod

# Frontend
npm run build && npm run preview
```

### Debug mode
```bash
# Backend
cd backend && npm run start:debug

# Frontend
npm run dev  # Already has source maps
```

---

## 📊 Admin Credentials (After Setup)

Create via registration:
- **Email**: admin@example.com
- **Password**: AdminPass123!
- **Role**: admin

Then navigate to: http://localhost:5173/admin/login

---

## 🐛 Troubleshooting

### Port 3000 in use
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change PORT in backend/.env
```

### Database connection error
```bash
# Check PostgreSQL
psql -U postgres -d mentor_bridge_bloom

# If doesn't exist
createdb mentor_bridge_bloom

# Verify .env credentials
cat backend/.env | grep DB_
```

### Redis connection error
```bash
# Check Redis
redis-cli ping

# Start if needed
redis-server
```

### Module not found
```bash
cd backend
rm -rf node_modules package-lock.json
npm install

cd ..
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Installed Dependencies

### Backend Key Packages
- `@nestjs/core` - NestJS framework
- `typeorm` - ORM
- `pg` - PostgreSQL driver
- `ioredis` - Redis client
- `@nestjs/jwt` - JWT authentication
- `bcrypt` - Password hashing
- `multer` - File uploads
- `sharp` - Image processing
- `socket.io` - WebSockets

### Frontend Key Packages
- `react` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `tailwindcss` - Styling
- `recharts` - Charts
- `socket.io-client` - WebSocket client
- `shadcn/ui` - Component library

---

## 🎯 Feature Checklist

- ✅ User Registration (3 roles)
- ✅ User Login/Logout
- ✅ Profile Management
- ✅ Profile Photo Upload
- ✅ Messaging System
- ✅ Connection Requests
- ✅ Alumni Directory (with 8 filters)
- ✅ Admin Analytics
- ✅ Performance Optimizations
- ✅ Security Features

---

## 🗂️ Project Structure

```
mentor-bridge-bloom/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   ├── database/
│   │   ├── common/
│   │   ├── main.ts
│   │   └── app.module.ts
│   ├── package.json
│   └── .env.example
├── src/
│   ├── pages/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── main.tsx
├── package.json
├── INSTALLATION.md
├── BACKEND_SETUP.md
└── IMPLEMENTATION_SUMMARY.md
```

---

## 📱 Testing the App

### 1. Register a new user
- Go to http://localhost:5173
- Click register
- Fill form with role selection
- Submit

### 2. Update profile
- Navigate to profile page
- Edit information
- Upload photo
- Add skills
- Save changes

### 3. Search alumni
- Go to Alumni Directory
- Use search box
- Apply filters
- View profiles
- Send connection request

### 4. Send message
- Go to Messages
- Select contact
- Type message
- Send

### 5. View analytics (admin only)
- Login as admin
- Go to /admin/analytics
- View dashboards
- Change date range
- Export data

---

## 🔗 Useful Links

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs
- **Database**: localhost:5432
- **Redis**: localhost:6379

---

## 💡 Pro Tips

1. Use `npm run start:dev` for hot-reload during development
2. Check browser console for frontend errors
3. Check terminal for backend errors
4. Use Chrome DevTools Network tab to debug API calls
5. Use Postman for API testing
6. Check `.env` if environment variables aren't working

---

## 📞 Help & Support

**Issue**: Backend won't start
- Check PORT not in use
- Verify DB connection
- Check .env file
- Review error message

**Issue**: Frontend won't load
- Clear node_modules
- Clear browser cache
- Check VITE_API_URL in .env
- Review console errors

**Issue**: Database errors
- Verify PostgreSQL running
- Check database exists
- Verify credentials in .env
- Run migrations: `npm run migration:run`

**Issue**: Performance slow
- Check Redis running
- Monitor database queries
- Check browser DevTools
- Clear cache

---

## 🚀 Next Phase

After basic setup, consider:
1. Add email notifications
2. Implement file storage (AWS S3)
3. Add video call integration
4. Setup CI/CD pipeline
5. Configure monitoring/logging
6. Add comprehensive test suite
7. Setup staging environment

---

**Version**: 1.0.0
**Last Updated**: November 14, 2025

Happy coding! 🎉
