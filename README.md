# 🎂 Birthday App

A full-stack birthday management application built with React, TypeScript, Express, and MongoDB.

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Creating Test Data](#-creating-test-data)
- [Default Test User](#-default-test-user)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### One-Command Setup

```bash
# Clone the repository
git clone https://github.com/yankimarkovich/birthday-app.git
cd birthday-app

# Start everything with Docker
docker-compose up --build
```

**That's it!** The application will be running at:

- **Frontend (React):** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Documentation:** http://localhost:5000/docs
- **MongoDB:** localhost:27017

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Docker Desktop** (recommended)
  - Download: https://www.docker.com/products/docker-desktop
  - Includes Docker Compose
  - Works on Windows, Mac, Linux

### Alternative (Manual Setup)

If you don't want to use Docker:

- **Node.js** 20+ and npm
  - Download: https://nodejs.org
- **MongoDB** 7.0+
  - Download: https://www.mongodb.com/try/download/community

---

## 🔧 Installation

### Method 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/yankimarkovich/birthday-app.git
cd birthday-app

# 2. Start all services
docker-compose up --build

# Wait for services to start (~30 seconds first time)
# You'll see:
# ✓ MongoDB connected successfully
# ✓ Server running on port 5000
# ✓ Frontend running on port 5173
```

**Access the application:**

- Open browser: http://localhost:5173
- Register a new account or use test user (see below)

### Method 2: Manual Setup (Without Docker)

#### Step 1: Start MongoDB

```bash
# Start MongoDB service
mongod --dbpath /path/to/data
```

#### Step 2: Start Backend

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and set:
# MONGODB_URI=mongodb://localhost:27017/birthday_app
# JWT_SECRET=your-secret-key

# Start server
npm run dev

# Server runs on http://localhost:5000
```

#### Step 3: Start Frontend

```bash
cd client

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env

# Start frontend
npm run dev

# Frontend runs on http://localhost:5173
```

---

## 🎭 Creating Test Data

The project includes scripts to populate the database with test birthdays.

### Option 1: Automatic Test Data (After Login)

```bash
# Make sure server is running
cd server

# Create test data (requires test user to exist)
npm run createTestData

# This creates:
# - 50 random birthdays throughout the year
# - 10 birthdays TODAY (for testing "Today" tab)
# - 5 special dates with multiple birthdays each
```

**What you'll see:**

```
Creating test data...
✓ Test user verified/created
✓ Creating 110 test birthdays
✓ 50 random birthdays created
✓ 10 birthdays for today created
✓ 50 birthdays for various dates created
✓ Test data created successfully!
```

### Option 2: Delete Test Data

```bash
cd server
npm run deleteTestData
```

---

## 👤 Default Test User

The app comes with a pre-configured test account:

### Test Account Credentials

```
Email:    test@example.com
Password: Test123!
```

### Using the Test Account

**Option A: Login with Test User**

1. Open http://localhost:5173
2. Click "Login"
3. Enter credentials above
4. Click "Sign In"

**Option B: Register New Account**

1. Open http://localhost:5173
2. Click "Register"
3. Fill in your details:
   - Name: Your Name
   - Email: your-email@example.com
   - Password: (min 8 characters)
4. Click "Sign Up"

**After Login:**

- Click "Create Test Data" button in dashboard (if available)
- Or run `npm run createTestData` in server folder

---

## 📜 Available Scripts

### Root Directory

```bash
# Start all services (Docker)
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# Reset database (delete all data)
docker-compose down -v

# View logs
docker-compose logs -f

# View server logs only
docker-compose logs -f server

# Rebuild images
docker-compose up --build
```

### Server (Backend)

```bash
cd server

# Development mode (hot reload)
npm run dev

# Production build
npm run build
npm start

# Create test data
npm run createTestData

# Delete test data
npm run deleteTestData

# Run tests
npm test

# Lint code
npm run lint
```

### Client (Frontend)

```bash
cd client

# Development mode (hot reload)
npm run dev

# Production build
npm run build
npm run preview

# Run tests
npm test

# Lint code
npm run lint
```

---

## 📁 Project Structure

```
birthday-app/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   └── features/            # Feature components
│   │   ├── pages/                   # Page components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Utilities & axios
│   │   ├── types/                   # TypeScript types
│   │   └── App.tsx
│   ├── Dockerfile.dev
│   └── package.json
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── controllers/             # Route controllers
│   │   ├── models/                  # Mongoose models
│   │   ├── routes/                  # Express routes
│   │   ├── middleware/              # Custom middleware
│   │   ├── schemas/                 # Zod validation
│   │   ├── config/                  # Configuration
│   │   ├── docs/                    # OpenAPI docs
│   │   └── index.ts
│   ├── scripts/
│   │   ├── create-test-data.js      # Test data script
│   │   └── delete-test-data.js      # Cleanup script
│   ├── Dockerfile.dev
│   └── package.json
│
├── docker-compose.yml               # Docker orchestration
├── DESIGN.md                        # Design decisions
└── README.md                        # This file
```

---

## 🏗️ Tech Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **shadcn/ui** - UI components (built on Radix UI)
- **Tailwind CSS** - Styling
- **React Query** - Server state management
- **Axios** - HTTP client
- **React Router** - Routing
- **date-fns** - Date manipulation

### Backend

- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM (Object Document Mapping)
- **JWT** - Authentication
- **Zod** - Validation & type inference
- **bcrypt** - Password hashing
- **Winston** - Logging
- **Swagger/OpenAPI** - API documentation

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **MongoDB 7.0** - Database container

---

## ✨ Features

### Core Features

- ✅ **User Authentication** - Register, login with JWT
- ✅ **Birthday Management** - Create, read, update, delete birthdays
- ✅ **Dashboard View** - See all your birthdays
- ✅ **Calendar View** - Visual calendar of birthdays
- ✅ **Today's Birthdays** - Filter birthdays happening today
- ✅ **This Month** - See birthdays in current month
- ✅ **Birthday Wishes** - Send wishes (once per year)
- ✅ **Responsive Design** - Works on mobile, tablet, desktop

### Technical Features

- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Real-time Validation** - Client & server-side with Zod
- ✅ **API Documentation** - Interactive Swagger UI
- ✅ **Request Logging** - Correlation IDs for tracking
- ✅ **Error Handling** - Centralized error management
- ✅ **Rate Limiting** - Protect against abuse
- ✅ **Health Checks** - Docker container monitoring
- ✅ **Hot Reload** - Fast development iteration

---

## 📖 API Documentation

Interactive API documentation is available at:

**http://localhost:5000/docs**

### Key Features

- 🔍 Browse all API endpoints
- 🧪 Test APIs directly in browser
- 📝 See request/response schemas
- 🔐 Authenticate with JWT token

### Using Swagger UI

1. **Login to get token:**
   - POST `/api/auth/login` with test credentials
   - Copy the `token` from response

2. **Authorize:**
   - Click "Authorize" button (top right)
   - Enter: `Bearer <your-token>`
   - Click "Authorize"

3. **Test Endpoints:**
   - Click any endpoint
   - Click "Try it out"
   - Fill in parameters
   - Click "Execute"
   - See response

### API Endpoints Summary

**Authentication:**
```
POST   /api/auth/register          - Create account
POST   /api/auth/login             - Login
```

**Birthdays:**
```
GET    /api/birthdays              - Get all birthdays
POST   /api/birthdays              - Create birthday
GET    /api/birthdays/today        - Get today's birthdays
GET    /api/birthdays/this-month   - Get this month's birthdays
GET    /api/birthdays/:id          - Get birthday by ID
PATCH  /api/birthdays/:id          - Update birthday
DELETE /api/birthdays/:id          - Delete birthday
POST   /api/birthdays/:id/wish     - Send birthday wish
```

**Health:**
```
GET    /health                     - Health check
```

---

## 🔐 Environment Variables

### Server (.env)

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/birthday_app?authSource=admin

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CLIENT_URL=http://localhost:5173

# Logging
LOG_LEVEL=info
```

### Client (.env)

```bash
# API Base URL
VITE_API_URL=http://localhost:5000
```

### Docker Compose (for development only)

⚠️ **Note:** Environment variables are in `docker-compose.yml` for convenience. In production, use proper secrets management.

---

## 🐛 Troubleshooting

### Port Already in Use

**Problem:** Port 5173, 5000, or 27017 already in use

**Solution:**

```bash
# Check what's using the port (Mac/Linux)
lsof -i :5173
lsof -i :5000
lsof -i :27017

# Kill the process
kill -9 <PID>

# Or change ports in docker-compose.yml:
ports:
  - "5174:5173"  # Use different host port
```

### Docker Build Fails

**Problem:** Docker build errors

**Solution:**

```bash
# Clean Docker cache
docker-compose down -v
docker system prune -a

# Rebuild
docker-compose up --build
```

### Database Connection Failed

**Problem:** Can't connect to MongoDB

**Solution:**

```bash
# Check MongoDB is running
docker-compose ps

# View MongoDB logs
docker-compose logs mongodb

# Reset MongoDB
docker-compose down -v
docker-compose up
```

### Frontend Can't Reach Backend

**Problem:** API calls fail with network error

**Solution:**

1. Check backend is running: http://localhost:5000/health
2. Check `VITE_API_URL` in client/.env
3. Check CORS settings in server/src/index.ts

### Test Data Script Fails

**Problem:** `npm run createTestData` fails

**Solution:**

```bash
# Make sure you're logged in first
# The script needs a valid user account

# Create user manually:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!"}'

# Then run script
npm run createTestData
```

### Hot Reload Not Working

**Problem:** Changes don't appear automatically

**Solution:**

```bash
# For frontend:
cd client
rm -rf node_modules .vite
npm install
npm run dev

# For backend:
cd server
rm -rf node_modules dist
npm install
npm run dev
```

### TypeScript Errors

**Problem:** Type errors in IDE

**Solution:**

```bash
# Rebuild TypeScript
npm run build

# Restart TypeScript server in VSCode
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## 📊 Database Access

### Using MongoDB Compass (GUI)

1. Download: https://www.mongodb.com/products/compass
2. Connect with URI:
   ```
   mongodb://admin:admin123@localhost:27017/birthday_app?authSource=admin
   ```

### Using mongosh (CLI)

```bash
# Connect to MongoDB
mongosh mongodb://admin:admin123@localhost:27017/birthday_app?authSource=admin

# View collections
show collections

# View users
db.users.find().pretty()

# View birthdays
db.birthdays.find().pretty()

# Count documents
db.birthdays.countDocuments()

# Exit
exit
```

---

## 🧪 Testing the Application

### Manual Testing Steps

1. **Register Account**
   - Go to http://localhost:5173
   - Click "Register"
   - Create account
   - Verify redirect to dashboard

2. **Create Birthday**
   - Click "Add Birthday"
   - Fill in name and date
   - Submit
   - Verify appears in list

3. **Test Filters**
   - Click "Today" tab
   - Click "This Month" tab
   - Click "All" tab

4. **Send Wish**
   - Find a birthday
   - Click "Send Wish"
   - Verify success message
   - Try sending again (should fail - once per year limit)

5. **Update Birthday**
   - Click edit icon
   - Change name or date
   - Save
   - Verify changes appear

6. **Delete Birthday**
   - Click delete icon
   - Confirm deletion
   - Verify removed from list

---

## 🚀 Production Deployment

### Build for Production

```bash
# Build frontend
cd client
npm run build
# Creates client/dist/

# Build backend
cd server
npm run build
# Creates server/dist/
```

### Environment Variables for Production

⚠️ **Important:** Change these for production:

```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Use production MongoDB (MongoDB Atlas)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/birthday_app

# Set NODE_ENV
NODE_ENV=production
```

---

## 📝 Additional Resources

- **Design Document:** [DESIGN.md](./DESIGN.md) - Architecture decisions
- **API Docs:** http://localhost:5000/docs - Interactive API documentation
- **Health Check:** http://localhost:5000/health - Server status

---

## 👨‍💻 Development

### Code Style

- **Linting:** ESLint + TypeScript
- **Formatting:** Prettier (auto-format on save)
- **Git Hooks:** Pre-commit linting (optional)

### Recommended VSCode Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- Docker

---

## 📄 License

MIT License - Created for interview purposes

---

## 🙏 Acknowledgments

Built with modern best practices for full-stack TypeScript development.

**Tech Stack:**
- Frontend: React 18, Vite, shadcn/ui, Tailwind
- Backend: Express, MongoDB, Mongoose, Zod
- DevOps: Docker, Docker Compose

---

## 📧 Support

For issues or questions:
1. Check [Troubleshooting](#-troubleshooting) section
2. Review [DESIGN.md](./DESIGN.md) for architecture details
3. Check API docs at http://localhost:5000/docs

---

**Created by:** Yanki Markovich
**Purpose:** Full Stack Developer Position Interview
**Last Updated:** 2025-11-03
