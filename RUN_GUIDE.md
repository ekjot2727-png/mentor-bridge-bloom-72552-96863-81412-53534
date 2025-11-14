# 🚀 Complete Setup & Run Guide

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Redis** (v6 or higher) - [Download](https://redis.io/download)
- **npm** (comes with Node.js)

### Verify Installations
Open PowerShell and run:
```powershell
node --version
npm --version
psql --version
redis-server --version
```

---

## 📋 Step 1: Install PostgreSQL & Create Database

### Windows Installation (PostgreSQL)

1. **Download PostgreSQL Installer**
   - Visit https://www.postgresql.org/download/windows/
   - Download PostgreSQL 15 or latest version

2. **Install PostgreSQL**
   - Run the installer
   - Remember the **password** you set for the `postgres` user
   - Keep the default port as `5432`
   - Install pgAdmin (recommended for GUI management)

3. **Create the Database**

   **Option A: Using pgAdmin (GUI - Recommended)**
   - Open pgAdmin 4 (installed with PostgreSQL)
   - Right-click on "Databases" → "Create" → "Database"
   - Name: `mentor_bridge_bloom`
   - Click "Save"

   **Option B: Using Command Line**
   ```powershell
   psql -U postgres
   ```
   Then type your postgres password when prompted.

   In the PostgreSQL prompt, run:
   ```sql
   CREATE DATABASE mentor_bridge_bloom;
   \l
   ```
   (The `\l` command lists all databases to verify creation)

   Then exit:
   ```sql
   \q
   ```

4. **Verify Database Creation**
   ```powershell
   psql -U postgres -d mentor_bridge_bloom -c "\dt"
   ```

---

## 🔴 Step 2: Install & Run Redis

### Windows Installation (Redis)

1. **Download Redis for Windows**
   - Visit https://github.com/microsoftarchive/redis/releases
   - Download `Redis-x64-*.msi` (latest version)
   - Or use: https://redis.io/download (WSL2 recommended for Windows 11)

2. **Install Redis**
   - Run the installer
   - Keep default port as `6379`
   - Check "Add Redis to PATH"
   - Complete installation

3. **Start Redis Server**
   ```powershell
   redis-server
   ```
   
   You should see output like:
   ```
   Ready to accept connections on 127.0.0.1:6379
   ```

   **Keep this terminal open!** Leave Redis running in the background.

4. **Verify Redis is Running** (in a new PowerShell window)
   ```powershell
   redis-cli ping
   ```
   
   Should return: `PONG`

---

## ⚙️ Step 3: Configure Environment Variables

### Backend Configuration

1. **Navigate to backend folder**
   ```powershell
   cd "c:\Users\Ekjot singh\Desktop\ALNET\mentor-bridge-bloom-72552-96863-81412-53534\backend"
   ```

2. **Copy .env.example to .env**
   ```powershell
   Copy-Item .env.example .env
   ```

3. **Edit .env file**
   Open `backend\.env` in VS Code and update:

   ```env
   NODE_ENV=development
   PORT=3000

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=YOUR_POSTGRES_PASSWORD    # ← Change this!
   DB_NAME=mentor_bridge_bloom
   DB_LOGGING=true

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_DB=0

   # JWT Configuration
   JWT_SECRET=mentor-bridge-bloom-super-secret-key-2024
   JWT_EXPIRATION=24h
   JWT_REFRESH_SECRET=mentor-bridge-bloom-refresh-key-2024
   JWT_REFRESH_EXPIRATION=7d

   # File Upload Configuration
   FILE_UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=10485760

   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

   **Important:** Replace `YOUR_POSTGRES_PASSWORD` with the password you set during PostgreSQL installation!

---

## 📦 Step 4: Install Dependencies

### Backend Dependencies

1. **Navigate to backend directory**
   ```powershell
   cd "c:\Users\Ekjot singh\Desktop\ALNET\mentor-bridge-bloom-72552-96863-81412-53534\backend"
   ```

2. **Install npm packages**
   ```powershell
   npm install
   ```
   
   This will install 891 packages. Wait for completion (~3-5 minutes).

3. **Verify installation**
   ```powershell
   npm list | head -20
   ```

### Frontend Dependencies

1. **Navigate to frontend directory** (in a new PowerShell window)
   ```powershell
   cd "c:\Users\Ekjot singh\Desktop\ALNET\mentor-bridge-bloom-72552-96863-81412-53534"
   ```

2. **Install npm packages**
   ```powershell
   npm install
   ```
   
   This will install 478 packages. Wait for completion (~2-3 minutes).

---

## 🗄️ Step 5: Create Database Tables

### Run Database Migrations

1. **Navigate to backend directory**
   ```powershell
   cd "c:\Users\Ekjot singh\Desktop\ALNET\mentor-bridge-bloom-72552-96863-81412-53534\backend"
   ```

2. **Run migrations** (creates all tables automatically)
   ```powershell
   npm run typeorm migration:run
   ```

3. **Verify tables were created**
   ```powershell
   psql -U postgres -d mentor_bridge_bloom -c "\dt"
   ```

   You should see tables like:
   - `user`
   - `user_profile`
   - `message`
   - `connection`
   - `event`
   - `job`
   - `analytics`

---

## 🎯 Step 6: Start the Application

### Terminal Setup (You need 3 terminals open)

#### Terminal 1: Redis Server (Keep Running)
```powershell
redis-server
```

Expected output:
```
Ready to accept connections on 127.0.0.1:6379
```

#### Terminal 2: Backend Server
```powershell
cd "c:\Users\Ekjot singh\Desktop\ALNET\mentor-bridge-bloom-72552-96863-81412-53534\backend"
npm run start:dev
```

Wait for output like:
```
[Nest] 12345 - 11/14/2025, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345 - 11/14/2025, 10:30:02 AM     LOG [InstanceLoader] DatabaseModule dependencies initialized
[Nest] 12345 - 11/14/2025, 10:30:03 AM     LOG [RoutesResolver] AuthController {/api/auth}...
Server is running on http://localhost:3000
```

#### Terminal 3: Frontend Server
```powershell
cd "c:\Users\Ekjot singh\Desktop\ALNET\mentor-bridge-bloom-72552-96863-81412-53534"
npm run dev
```

Wait for output like:
```
VITE v5.4.19  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## ✅ Step 7: Verify Everything is Running

### Check All Services

1. **Frontend** - Open in browser:
   ```
   http://localhost:5173
   ```

2. **Backend API** - Open in browser:
   ```
   http://localhost:3000/api/docs
   ```
   (Swagger documentation should load)

3. **Check Backend Health**:
   ```powershell
   Invoke-WebRequest -Uri http://localhost:3000/health
   ```

4. **Check Database Connection** - In psql:
   ```powershell
   psql -U postgres -d mentor_bridge_bloom -c "SELECT * FROM public.user LIMIT 1;"
   ```

---

## 🧪 Step 8: Test the Application

### Create a Test User

1. **Open Swagger Documentation**
   - Visit: http://localhost:3000/api/docs

2. **Test Registration**
   - Find the `/api/auth/register` endpoint
   - Click "Try it out"
   - Enter test data:
   ```json
   {
     "email": "student@example.com",
     "password": "Test@1234",
     "firstName": "John",
     "lastName": "Doe",
     "role": "STUDENT"
   }
   ```
   - Click "Execute"
   - Should see a 201 response with JWT token

3. **Test Login**
   - Find `/api/auth/login` endpoint
   - Use the email/password you just created
   - Should receive a JWT token

### Login in Frontend

1. **Navigate to http://localhost:5173**

2. **Try Student Login**
   - Click "Student Login"
   - Email: `student@example.com`
   - Password: `Test@1234`
   - Should redirect to Student Portal

---

## 🐛 Troubleshooting

### Problem: "Port 3000 already in use"
```powershell
# Find process using port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Kill it (replace XXXX with PID)
Stop-Process -Id XXXX -Force
```

### Problem: "Cannot connect to PostgreSQL"
```powershell
# Check PostgreSQL is running
Get-Process postgres

# If not running, start it manually
# In Windows Services, search for PostgreSQL, click "Start"
```

### Problem: "Cannot connect to Redis"
```powershell
# Check Redis is running
Get-Process redis-server

# If not, start it
redis-server

# Test connection
redis-cli ping
```

### Problem: "Database does not exist"
```powershell
psql -U postgres
```
Then in psql prompt:
```sql
CREATE DATABASE mentor_bridge_bloom;
\c mentor_bridge_bloom
\dt
```

### Problem: "npm install fails"
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Reinstall
npm install
```

### Problem: "VITE error on startup"
```powershell
# Check Node version
node --version

# Should be v18 or higher. If not, update Node.js
```

---

## 📊 Database Schema

The application creates these tables:

```
user (Users table)
├── id (UUID, PK)
├── email (unique)
├── password (hashed)
├── firstName
├── lastName
├── role (STUDENT, ALUMNI, ADMIN)
└── timestamps

user_profile (Extended profile info)
├── id (UUID, PK)
├── userId (FK)
├── photo (URL)
├── skills (JSON array)
├── company
├── location
├── graduationYear
└── industry

message (Messages)
├── id (UUID, PK)
├── senderId (FK)
├── recipientId (FK)
├── content
├── isRead
└── timestamps

connection (Mentorship connections)
├── id (UUID, PK)
├── mentorId (FK)
├── menteeId (FK)
├── status (PENDING, ACCEPTED, REJECTED)
└── timestamps

event, job, analytics (Additional tables)
```

---

## 🔗 Useful URLs

Once running:

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:3000 |
| **Swagger Docs** | http://localhost:3000/api/docs |
| **PostgreSQL** | localhost:5432 |
| **Redis** | localhost:6379 |

---

## 📝 Common npm Commands

```powershell
# Backend commands
npm run start           # Start production
npm run start:dev       # Start development (auto-reload)
npm run build          # Build for production
npm run test           # Run tests

# Database commands
npm run typeorm migration:run      # Run migrations
npm run typeorm migration:revert   # Rollback migrations
npm run typeorm schema:sync        # Sync schema
```

---

## ✨ Next Steps

1. ✅ Start all 3 services (Redis, Backend, Frontend)
2. ✅ Visit http://localhost:5173
3. ✅ Create a test account
4. ✅ Explore the admin dashboard
5. ✅ Check Swagger API documentation

---

## 📞 Need Help?

**Check these docs in order:**
1. `QUICK_START.md` - 5-minute reference
2. `STARTUP_GUIDE.md` - Detailed setup
3. `BACKEND_SETUP.md` - API architecture
4. `WHATS_INCLUDED.md` - Feature overview

---

**You're all set!** 🎉 Your Mentor Bridge Bloom platform is ready to run!
