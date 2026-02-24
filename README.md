# 🌿 LeaveFlow — Employee Leave Management System

A production-ready, full-stack Employee Leave Management System built with React.js, Tailwind CSS, Node.js, Express, and MongoDB.

## 🚀 Live Features

| Feature | Status |
|---------|--------|
| JWT Authentication | ✅ |
| Role-Based Access (Admin/Manager/Employee) | ✅ |
| Employee Leave Application | ✅ |
| Manager Approve/Reject Workflow | ✅ |
| Admin User Management | ✅ |
| Chart.js Analytics | ✅ |
| Dark/Light Mode Toggle | ✅ |
| Responsive Mobile Sidebar | ✅ |
| Toast Notifications | ✅ |
| Protected Routes | ✅ |
| Context API Global State | ✅ |

---

## 🧱 Tech Stack

**Frontend:** React 19, Tailwind CSS v4, React Router v7, Chart.js, Axios, React Hot Toast, Lucide React

**Backend:** Node.js, Express 5, MongoDB, Mongoose, JWT, Bcrypt.js, Morgan

---

## 📁 Folder Structure

```
Employee Leave Management/
├── server.js                   # Express app entry point
├── .env                        # Backend environment variables
├── server/
│   ├── config/db.js            # MongoDB connection
│   ├── models/
│   │   ├── User.js             # User schema (name, email, role, isActive)
│   │   └── Leave.js            # Leave schema (type, dates, status, reason)
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, GetMe
│   │   ├── userController.js   # CRUD, role assignment, activate/deactivate
│   │   └── leaveController.js  # Apply, list, approve, reject, stats
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── leaveRoutes.js
│   └── middleware/
│       ├── authMiddleware.js   # JWT verification
│       ├── roleMiddleware.js   # Role-based access
│       └── errorHandler.js    # Global error handler
└── client/
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.jsx  # user, token, login, logout, register
    │   │   ├── LeaveContext.jsx # leaveList, fetchLeaves, createLeave, approve/reject
    │   │   └── ThemeContext.jsx # dark/light mode
    │   ├── services/api/
    │   │   ├── axiosInstance.js # Axios with interceptors
    │   │   └── index.js        # authService, userService, leaveService
    │   ├── routes/
    │   │   ├── ProtectedRoute.jsx
    │   │   └── RoleBasedRoute.jsx
    │   ├── components/
    │   │   ├── ui/             # DashboardCard, DataTable, Modal, StatusBadge, Loader
    │   │   └── layout/         # Sidebar, Navbar, DashboardLayout
    │   └── pages/
    │       ├── LandingPage.jsx
    │       ├── auth/           # LoginPage, RegisterPage
    │       └── dashboard/      # EmployeeDashboard, ManagerDashboard, AdminDashboard
    └── tailwind.config.js
```

---

## 🌐 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login & get JWT |
| GET | `/api/auth/me` | Auth | Current user |
| GET | `/api/users` | Admin/Manager | List all users |
| PATCH | `/api/users/:id/role` | Admin | Update role |
| PATCH | `/api/users/:id/status` | Admin | Toggle active |
| GET | `/api/users/stats` | Admin | User statistics |
| POST | `/api/leaves` | Employee | Apply for leave |
| GET | `/api/leaves` | Auth | Get leaves |
| PATCH | `/api/leaves/:id/approve` | Manager/Admin | Approve leave |
| PATCH | `/api/leaves/:id/reject` | Manager/Admin | Reject leave |
| GET | `/api/leaves/stats` | Auth | Leave analytics |
| DELETE | `/api/leaves/:id` | Employee | Delete pending leave |

---

## ⚙️ Environment Variables

### Backend `.env`
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/employee_leave_management
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend `client/.env`
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js >= 18
- MongoDB (running locally or MongoDB Atlas)

### 1. Install Backend Dependencies
```bash
npm install
```

### 2. Install Frontend Dependencies
```bash
cd client
npm install
```

### 3. Configure Environment
- Edit `.env` in root — set your `MONGO_URI` and `JWT_SECRET`
- Edit `client/.env` — update if backend port differs from 5000

### 4. Run Backend (Terminal 1)
```bash
npm run dev
```
Server starts at `http://localhost:5000`

### 5. Run Frontend (Terminal 2)
```bash
cd client
npm run dev
```
App starts at `http://localhost:5173`

---

## 🔐 Demo Credentials

Once you seed the database (or register users), use:

> **Admin:** admin@demo.com / password123  
> **Manager:** manager@demo.com / password123  
> **Employee:** employee@demo.com / password123

---

## 🎨 UI Highlights

- Fresh green fintech theme with gradient accents
- Glassmorphism effects on auth pages
- Animated dashboard cards with slide-up effects
- Inline role dropdown in Admin panel
- Status badges (Pending/Approved/Rejected)
- Chart.js Bar, Doughnut, and Line charts
- Dark mode toggle (persisted to localStorage)
- Mobile-first responsive sidebar

---

## 📊 Role Capabilities

| Feature | Employee | Manager | Admin |
|---------|:--------:|:-------:|:-----:|
| Apply Leave | ✅ | ❌ | ❌ |
| View Own Leaves | ✅ | ✅ | ✅ |
| Approve/Reject Leaves | ❌ | ✅ | ✅ |
| View All Leaves | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Assign Roles | ❌ | ❌ | ✅ |
| Analytics Charts | ❌ | ✅ | ✅ |
