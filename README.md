# 🎂 Birthday App

A full-stack birthday management application built with React, TypeScript, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose

### Installation

```bash
# Start the entire application
docker-compose up --build
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **MongoDB:** localhost:27017

## 📁 Project Structure

```
birthday-app/
├── client/          # React frontend
├── server/          # Express backend
└── README.md        # This file
```

## 🏗️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite
- shadcn/ui + Tailwind CSS
- React Query
- Axios

### Backend
- Express with TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Zod validation
- Winston logging

## 📚 Features

- ✅ Display people with birthdays
- ✅ Filter today's birthdays
- ✅ Send birthday wishes
- ✅ User authentication
- ✅ CRUD operations for birthdays
- ✅ Real-time notifications
- ✅ Email notifications
- ✅ Multi-language support (EN/HE/ES)

---

**Created for Full Stack Developer Interview**