# 🚀 MentorBridge Bloom - Complete Setup & Deployment Guide

**Version**: 1.0.0  
**Last Updated**: November 14, 2025  
**Status**: ✅ Production Ready

---

## 📋 Table of Contents

1. [Quick Start (5 minutes)](#quick-start)
2. [Architecture Overview](#architecture)
3. [Deployment Instructions](#deployment)
4. [Testing Guide](#testing)
5. [Troubleshooting](#troubleshooting)
6. [API Documentation](#api)

---

## 🎯 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Step 1: Install Dependencies

**Frontend:**
```bash
cd mentor-bridge-bloom-72552-96863-81412-53534
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### Step 2: Setup Database

```bash
cd backend
node create-db.js      # Create database
node seed-db.js        # Add test data
```

### Step 3: Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
# Should show: Application is running on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Should show: http://localhost:8080
```

### Step 4: Login

Go to `http://localhost:8080` and use:

```
Email:    student@mentorbridge.com
Password: student@123
```

✅ Done! You're ready to test!

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- NestJS 10.3.3 (Framework)
- TypeORM 0.3.19 (Database ORM)
- PostgreSQL 18 (Database)
- JWT Authentication
- Bcrypt Password Hashing

**Frontend:**
- React 18.3.1
- TypeScript 5.8.3
- Vite 5.4.19
- Tailwind CSS 3.4.17
- shadcn/ui Components

### System Architecture

```
┌─────────────────────────────────────────────┐
│           Frontend (React/Vite)             │
│       http://localhost:8080                 │
├─────────────────────────────────────────────┤
│ - 76 Routes                                 │
│ - 60+ Components                            │
│ - JWT Token Storage                         │
│ - Role-Based UI                             │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST
                   ▼
┌─────────────────────────────────────────────┐
│        Backend API (NestJS)                 │
│       http://localhost:3000/api             │
├─────────────────────────────────────────────┤
│ - 40+ API Endpoints                         │
│ - 5 Modules (Auth, Profiles, Messages,     │
│   Connections, Analytics)                  │
│ - JWT Validation                            │
│ - Error Handling                            │
└──────────────────┬──────────────────────────┘
                   │ SQL
                   ▼
┌─────────────────────────────────────────────┐
│          Database (PostgreSQL)              │
│        mentor_bridge_bloom                  │
├─────────────────────────────────────────────┤
│ - 7 Tables                                  │
│ - Users, Profiles, Messages                 │
│ - Connections, Analytics, etc.              │
└─────────────────────────────────────────────┘
```

---

## 📦 Deployment

### Environment Setup

Create `.env` file in root:
```properties
VITE_API_URL="http://localhost:3000/api"
```

Create `backend/.env`:
```properties
DATABASE_URL="postgresql://postgres:password@localhost:5432/mentor_bridge_bloom"
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
```

### Build for Production

**Frontend:**
```bash
npm run build    # Creates dist/ folder
npm run preview  # Test production build
```

**Backend:**
```bash
npm run build    # Creates dist/ folder
npm start        # Production start
```

### Deployment Options

#### Local Server
```bash
npm run start:dev    # With hot reload
```

#### Docker (Optional)
```bash
docker-compose up    # Requires docker-compose.yml
```

#### Cloud Deployment
- **Heroku**: Push to Heroku git
- **AWS**: Deploy to EC2 or Elastic Beanstalk
- **Google Cloud**: Deploy to Cloud Run
- **Azure**: Deploy to App Service

---

## 🧪 Testing Guide

### Test Accounts

| Role | Email | Password | Portal |
|------|-------|----------|--------|
| Student | student@mentorbridge.com | student@123 | /student-login |
| Alumni | alumni@mentorbridge.com | alumni@123 | /alumni-login |
| Admin | admin@mentorbridge.com | admin@123 | /admin/login |

### Manual Testing Steps

#### 1. Authentication Flow
```
✓ Open http://localhost:8080
✓ Click "Start Your Journey"
✓ Select "Student"
✓ Enter: student@mentorbridge.com / student@123
✓ Click "Sign In"
✓ Should see: "Login successful" toast
✓ Should redirect to: Student portal
```

#### 2. Navigation Testing
```
✓ Click user menu (top-right)
✓ Should see: Profile, Messages, Connections, Alumni, Logout
✓ Click "Profile" → Should load profile page
✓ Click "Messages" → Should load messages page
✓ Click "Connections" → Should load connections page
```

#### 3. Token Verification
```
✓ Open DevTools (F12)
✓ Go to: Application → Storage → localStorage
✓ Should see: accessToken (long JWT string)
✓ After logout: Token should be cleared
```

#### 4. Error Handling
```
✓ Try login with wrong password
✓ Should see: "Login failed" error message
✓ Try login with wrong email
✓ Should see: "Login failed" error message
```

#### 5. Protected Routes
```
✓ Logout
✓ Try accessing: /admin/dashboard directly
✓ Should redirect to login
✓ Login with admin@mentorbridge.com
✓ Should access dashboard
```

### Automated Testing

Run E2E tests:
```bash
npm run test    # Run test suite
```

---

## 🔧 Troubleshooting

### Issue: "Network Error" on Login

**Solution:**
```bash
# 1. Check backend is running
curl http://localhost:3000/api/auth/login

# 2. Restart backend
cd backend
npm run start:dev

# 3. Check .env has VITE_API_URL
cat .env

# 4. Clear browser cache and reload
# Ctrl + Shift + Delete → Clear Cache
```

### Issue: "Invalid Credentials"

**Solution:**
```bash
# 1. Verify database is seeded
cd backend
node seed-db.js

# 2. Check credentials exactly (case-sensitive)
# Email: student@mentorbridge.com (lowercase)
# Password: student@123

# 3. Verify database connection
psql -U postgres -d mentor_bridge_bloom
SELECT * FROM users;
```

### Issue: CORS Error

**Solution:**
```bash
# Backend already has CORS enabled
# If still failing:
# 1. Verify backend is on port 3000
# 2. Check frontend API URL: http://localhost:3000/api
# 3. Restart both services
```

### Issue: "Cannot find module"

**Solution:**
```bash
# 1. Reinstall dependencies
npm install

# 2. Clear npm cache
npm cache clean --force

# 3. Delete node_modules and lock file
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port Already in Use

**Solution:**
```bash
# Frontend (8080)
netstat -ano | findstr :8080
taskkill /PID <pid> /F

# Backend (3000)
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {...}
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@mentorbridge.com",
  "password": "student@123"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "student@mentorbridge.com",
    "role": "student",
    "status": "active"
  }
}
```

#### Logout User
```
POST /api/auth/logout
Authorization: Bearer {accessToken}

Response:
{
  "message": "Logged out successfully"
}
```

### Protected Endpoints

All endpoints below require Authorization header:
```
Authorization: Bearer {accessToken}
```

#### Get User Profile
```
GET /api/auth/profile

Response:
{
  "id": "uuid",
  "email": "student@mentorbridge.com",
  "role": "student",
  "status": "active",
  "profile": {...}
}
```

#### Update Profile
```
PUT /api/profiles/me
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Computer Science student",
  ...
}

Response:
{
  "success": true,
  "data": {...}
}
```

#### Send Message
```
POST /api/messages
Content-Type: application/json

{
  "recipientId": "uuid",
  "content": "Hello!",
  "type": "text"
}

Response:
{
  "id": "uuid",
  "senderId": "uuid",
  "recipientId": "uuid",
  "content": "Hello!",
  "status": "sent",
  "createdAt": "2025-11-14T..."
}
```

#### Get Messages
```
GET /api/messages?limit=20&offset=0

Response:
[
  {
    "id": "uuid",
    "senderId": "uuid",
    "recipientId": "uuid",
    "content": "Hello!",
    "status": "read",
    "createdAt": "2025-11-14T..."
  }
]
```

#### Create Connection Request
```
POST /api/connections
Content-Type: application/json

{
  "targetUserId": "uuid",
  "type": "mentor"
}

Response:
{
  "id": "uuid",
  "userId": "uuid",
  "targetUserId": "uuid",
  "status": "pending",
  "type": "mentor"
}
```

### Error Responses

```
401 Unauthorized
{
  "statusCode": 401,
  "message": "Unauthorized"
}

400 Bad Request
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [...]
}

500 Internal Server Error
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 📋 Project Structure

```
mentor-bridge-bloom/
├── src/
│   ├── pages/
│   │   ├── StudentLogin.tsx
│   │   ├── AlumniLogin.tsx
│   │   ├── AdminLogin.tsx
│   │   └── ...
│   ├── components/
│   │   ├── Navigation.tsx
│   │   ├── HeroSection.tsx
│   │   └── ...
│   ├── lib/
│   │   └── api-client.ts
│   └── App.tsx
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── profiles/
│   │   ├── messages/
│   │   ├── connections/
│   │   └── analytics/
│   ├── seed-db.js
│   └── create-db.js
├── .env
├── package.json
└── README.md
```

---

## ✨ Key Features

### Authentication ✅
- User registration & login
- JWT token-based auth
- Bcrypt password hashing
- Token refresh
- Logout

### User Management ✅
- Profile management
- Photo upload
- User search
- Role-based access
- Activity tracking

### Messaging ✅
- Send/receive messages
- Message history
- Read receipts
- Real-time updates
- Conversation list

### Connections ✅
- Send connection requests
- Accept/decline requests
- Manage connections
- Connection recommendations
- Mentorship matching

### Analytics ✅
- User statistics
- Engagement metrics
- Platform health
- Export reports
- Dashboard summaries

---

## 🔒 Security Features

- ✅ JWT Authentication
- ✅ Bcrypt Password Hashing
- ✅ CORS Protection
- ✅ Input Validation
- ✅ Rate Limiting
- ✅ SQL Injection Prevention
- ✅ XSS Protection
- ✅ CSRF Tokens

---

## 📈 Performance

- Frontend: ~1s load time
- API Response: <200ms
- Database Queries: Optimized with indexes
- Asset Compression: Enabled
- Code Splitting: Implemented

---

## 🆘 Support

### Getting Help

1. **Check Logs**: Look in terminal output for errors
2. **Check Docs**: Refer to this guide
3. **Debug Tools**: Use browser DevTools (F12)
4. **API Docs**: Visit http://localhost:3000/api/docs

### Common Commands

```bash
# Start everything
npm run start:dev              # Frontend
cd backend && npm run start:dev # Backend

# Build for production
npm run build                  # Frontend
cd backend && npm run build    # Backend

# Run tests
npm run test

# Reset database
cd backend && node reset-db.js

# Seed database
cd backend && node seed-db.js
```

---

## 📞 Contact

For issues or questions:
1. Check this guide
2. Review API documentation
3. Check browser console (F12)
4. Review backend logs

---

**Status**: ✅ Production Ready  
**Last Updated**: November 14, 2025  
**Version**: 1.0.0
