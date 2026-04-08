# 🛠️ BProduct Setup Guide

## 📋 Prerequisites
- Python 3.8+ (with venv)
- Node.js 16+
- npm or yarn

---

## 🚀 Setup Instructions

### **1. FastAPI Backend Setup**

#### Install Dependencies
```bash
cd API
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On macOS/Linux

pip install -r requirements.txt
```

#### Seed Admin Users
```bash
python seed.py
```

This creates two admin users:
- **Email:** `admin@example.com` → **Password:** `admin123`
- **Email:** `berithajao@gmail.com` → **Password:** `admin123`

#### Run FastAPI Server
```bash
python -m uvicorn main:app --reload --port 8000
```

---

### **2. Admin Backend Setup**

#### Install Dependencies
```bash
cd admin-backend
npm install
```

#### Seed Admin Users
```bash
npm run seed
```

#### Run Admin Backend
```bash
npm run dev  # Runs on port 3001
```

---

### **3. Admin Frontend Setup**

```bash
cd admin-frontend
npm install
npm run dev  # Runs on port 5173
```

**Login with:**
- Email: `admin@example.com`
- Password: `admin123`

---

### **4. User Frontend Setup**

```bash
cd frontend
npm install
npm run dev  # Runs on port 5173 (or 5174)
```

---

## 🗂️ Project Architecture

```
┌─────────────────────────────────────────┐
│         Shared SQLite Database          │
└─────────────────────────────────────────┘
           ↑                    ↑
    ┌──────┴──────┐      ┌─────┴──────┐
    │   FastAPI   │      │  Node.js   │
    │  (Port 8000)│      │ (Port 3001)│
    └──────┬──────┘      └─────┬──────┘
           ↓                    ↓
    ┌──────────────┐      ┌──────────────┐
    │ User Frontend│      │Admin Frontend│
    │ (Port 5173)  │      │ (Port 5174)  │
    └──────────────┘      └──────────────┘
```

---

## 📡 API Endpoints

### **Authentication**
- `POST /login` - User login
- `POST /admin/login` - Admin login
- `POST /admin/create` - Create new admin
- `GET /me` - Get current user

### **Admin Endpoints** (All require authentication)
- `GET /api/stats` - Dashboard stats
- `GET /api/users` - List all users
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `DELETE /api/products/:id` - Delete product
- `GET /api/posts` - List posts
- `GET /api/orders` - List orders
- `PATCH /api/orders/:id/status` - Update order status

---

## 🔐 Authentication Flow

### Admin Login
```
1. Admin enters email + password on login page
2. Frontend calls POST /admin/login (FastAPI)
3. FastAPI validates against Admin table
4. Returns JWT token if valid
5. Token stored in localStorage
6. All admin-backend API calls include token
7. Admin-backend validates token = checks Admin table
```

### Regular User Login
```
1. User enters email + password
2. Frontend calls POST /login (FastAPI)
3. FastAPI validates against User table
4. Returns JWT token
5. User can access user app only
```

---

## 🗄️ Database Schema

### Admin Table
```sql
CREATE TABLE admin (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  hashed_password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### User Table
```sql
CREATE TABLE "user" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  bio TEXT,
  avatar_url TEXT
);
```

---

## 💡 Useful Commands

### FastAPI
```bash
# Run with auto-reload
python -m uvicorn main:app --reload

# Visit API docs
http://localhost:8000/docs
```

### Admin Backend
```bash
npm run dev      # Development with nodemon
npm run seed     # Seed database
npm start        # Production
```

### Admin Frontend
```bash
npm run dev      # Development
npm run build    # Production build
npm run preview  # Preview build
```

---

## 🐛 Troubleshooting

### Admin can't login
1. Make sure FastAPI server is running on port 8000
2. Run `python seed.py` to create admin users
3. Check credentials: admin@example.com / admin123

### Admin backend returns 401
1. Verify token is stored in localStorage
2. Check if token matches between FastAPI and admin-backend
3. Ensure both use same `SECRET_KEY` from .env

### Database locked
1. Make sure only one Python process is accessing the database
2. Restart the FastAPI server
3. Delete `database.db` and re-seed if needed

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [React Documentation](https://react.dev/)

