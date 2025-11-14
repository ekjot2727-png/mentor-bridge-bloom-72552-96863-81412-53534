# 🔧 PostgreSQL Password Reset Guide

## Problem
The application cannot connect to PostgreSQL because the password is incorrect.

## Solution: Reset PostgreSQL Password

### Option 1: Using Windows Services (Easiest)

1. **Open Services Manager**
   - Press `Win + R`
   - Type: `services.msc`
   - Press Enter

2. **Find PostgreSQL Service**
   - Look for "postgresql-x64-18" or similar
   - Right-click → Properties
   - Note the "Log On" tab to see which user it runs as

3. **Reset Password via pgAdmin** (Recommended)
   - Open pgAdmin 4 (should be in Start Menu)
   - Server: localhost:5432
   - Default User: postgres
   - If prompted for password, try common defaults:
     - `postgres`
     - Leave blank
     - `123456`
     - Check your installation notes

### Option 2: If You Remember the Installation Password

Update the `.env` file in `backend/.env`:

```env
DB_PASSWORD=YOUR_ACTUAL_POSTGRES_PASSWORD
```

Replace `YOUR_ACTUAL_POSTGRES_PASSWORD` with the password you set during installation.

### Option 3: Reset PostgreSQL on Windows (Advanced)

1. **Stop PostgreSQL Service**
   ```powershell
   Stop-Service -Name "postgresql-x64-18" -Force
   ```

2. **Open postgres.conf**
   - File location: `C:\Program Files\PostgreSQL\18\data\postgresql.conf`
   - Find the line: `#password_encryption = 'scram-sha-256'`
   - Change to: `password_encryption = 'md5'`
   - Save

3. **Modify pg_hba.conf**
   - File location: `C:\Program Files\PostgreSQL\18\data\pg_hba.conf`
   - Change trust method for local connections from `scram-sha-256` to `trust`
   - Find lines with `scram-sha-256` and replace with `trust`

4. **Restart PostgreSQL Service**
   ```powershell
   Start-Service -Name "postgresql-x64-18"
   ```

5. **Reset Password Using psql**
   ```powershell
   &"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
   ```

6. **Restore Security**
   - Edit `pg_hba.conf` again
   - Change `trust` back to `scram-sha-256`
   - Restart PostgreSQL

### Option 4: Use Default Empty Password

Edit `backend/.env`:
```env
DB_PASSWORD=
```

Then restart the backend.

---

## After Fixing the Password

1. **Update backend/.env**
   - Set correct DB_PASSWORD

2. **Restart Backend**
   - Stop the backend process (if running)
   - Run: `npm run start:dev`

3. **The backend should now connect!**

---

## What Do You Need to Do?

1. **Try Option 1 first** - Use pgAdmin to reset the password
2. **Then tell me** - What password you set or want to use
3. **I'll update** - The .env file for you
4. **Restart** - The backend will connect!

---

**Let me know when you've tried one of these options!**
