# 🎂 Birthday App

A full-stack birthday management application built with React, TypeScript, Express, and MongoDB.

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Creating Test Data](#-creating-test-data)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [API Documentation](#-api-documentation)
- [Development](#-development)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Docker Desktop** (recommended)
  - Download: https://www.docker.com/products/docker-desktop
  - Includes Docker Compose
  - Works on Windows, Mac, Linux

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

## 🎭 Creating Test Data

The project includes scripts to populate the database with test birthdays.

### Automatic Test Data (After Login)

```bash
# Make sure server is running
cd server/scripts

# Create test data
npm run createTestData
OR
node create-test-data.js

# This creates:
# - Test user to login with: Email: test@example.com,  Password: Test123!
# - 50 random birthdays throughout the year
# - 10 birthdays TODAY (for testing "Today" tab)
# - 5 special dates with multiple birthdays each
```

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

### Technical Features

- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Real-time Validation** - Client & server-side with Zod
- ✅ **API Documentation** - Interactive Swagger UI
- ✅ **Request Logging** - Correlation IDs for tracking
- ✅ **Error Handling** - Centralized error management
- ✅ **Rate Limiting** - Protect against abuse
- ✅ **Health Checks** - Docker container monitoring

---

**Created by:** Yanki Markovich
**Purpose:** Full Stack Developer Position Interview
**Last Updated:** 2025-11-03
