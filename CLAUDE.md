# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PrimeVentra** is a full-stack property listing marketplace built as a monorepo with three main applications:

1. **Frontend** (`Frontend/`) - Main property listing and browsing application for users
2. **AdminDashboard** (`AdminDashboard/`) - Admin panel for managing listings, customers, and payments
3. **Backend** (`Backend/`) - Node.js/Express API server handling authentication, listings, and payments

## Technology Stack

### Frontend & AdminDashboard
- **Framework**: React 19 with React Router 7 for navigation
- **Build Tool**: Vite 8 with @vitejs/plugin-react (using Oxc for fast compilation)
- **Database Access**: Supabase (@supabase/supabase-js)
- **Linting**: ESLint with React plugins
- **PDF Generation**: jsPDF (Frontend only)
- **Icons**: Material Symbols

### Backend
- **Runtime**: Node.js with ES modules
- **Server**: Express.js 5.2
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Twilio SMS OTP integration for phone-based auth
- **Email**: Nodemailer for email notifications
- **CORS**: Enabled for cross-origin requests (currently open to all origins)

### Shared
- **Environment Management**: dotenv
- **Package Manager**: npm with workspace scripts at root

## Project Structure

```
Backend/
  ├─ server.js              # Main Express app (PORT: 5000)
  ├─ routes/
  │  └─ auth.js            # OTP authentication endpoints
  ├─ utils/
  │  └─ sms.js             # Twilio SMS integration
  ├─ .env                  # Backend environment variables
  └─ *.js                  # Helper/test scripts for DB inspection
  
Frontend/
  ├─ src/
  │  ├─ pages/             # Route pages (Home, Listing, ListProperty, Profile, Login, etc.)
  │  ├─ components/        # Reusable components (navbar, footer, etc.)
  │  ├─ api/
  │  │  └─ supabaseClient.js   # Supabase client initialization
  │  ├─ assets/            # Images and static files
  │  ├─ styles/            # CSS files (globals.css)
  │  ├─ constants/         # App constants (countries list, etc.)
  │  ├─ App.jsx            # Main app with routes
  │  └─ main.jsx           # React root render
  ├─ vite.config.js        # Vite config with API proxy to localhost:5000
  ├─ .env                  # Frontend env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
  └─ package.json

AdminDashboard/
  ├─ src/
  │  ├─ pages/             # Dashboard pages (Dashboard, Drafts, Customers, Analytics, etc.)
  │  ├─ components/        # UI components (AdminLayout, Sidebar, Topbar, etc.)
  │  ├─ context/           # React Context (AdminContext.jsx for state)
  │  ├─ constants/         # Districts list and navigation config
  │  ├─ styles/            # CSS files
  │  ├─ App.jsx            # Main admin app
  │  └─ main.jsx           # React root render
  ├─ vite.config.js
  ├─ .env
  └─ package.json

package.json (root)         # Workspace scripts using concurrently
```

## Common Development Commands

### Install Dependencies
```bash
# Install all dependencies for Frontend and Backend
npm run install:all

# Or individually:
npm install --prefix Frontend
npm install --prefix Backend
npm install --prefix AdminDashboard
```

### Development
```bash
# Run all apps concurrently (Frontend + Backend)
npm run dev

# Run individual apps:
npm run dev --prefix Frontend        # Vite dev server (http://localhost:5173)
npm run dev --prefix Backend         # Express server (http://localhost:5000)
npm run dev --prefix AdminDashboard  # Vite dev server (http://localhost:5173)
```

### Build
```bash
# Build Frontend for production
npm run build --prefix Frontend

# Build AdminDashboard for production
npm run build --prefix AdminDashboard

# Build and start (runs build:frontend + Backend start)
npm start
```

### Linting
```bash
# Lint Frontend
npm run lint --prefix Frontend

# Lint AdminDashboard
npm run lint --prefix AdminDashboard
```

### Preview
```bash
# Preview production build locally
npm run preview --prefix Frontend
npm run preview --prefix AdminDashboard
```

## Key Architecture Patterns

### Authentication Flow
- **Frontend**: Phone-based OTP via Twilio integration
- **Backend Routes**: `/api/auth/request-otp` triggers SMS sending
- **Session Storage**: User stored in `sessionStorage` as `portalUser` (checked in ProtectedRoute)
- **Protected Routes**: Implemented via `ProtectedRoute` wrapper in App.jsx - redirects to login if user not authenticated

### API Communication
- **Frontend to Backend**: Vite proxy routes `/api/*` to `http://localhost:5000`
- **Supabase Direct**: Frontend uses Supabase client for direct database queries
- **Backend Services**: Express endpoints for complex operations (SMS, email, payments)

### Supabase Integration
- **Frontend**: Uses anon key (VITE_SUPABASE_ANON_KEY) with RLS policies
- **Backend**: Uses service role key for administrative/bypass operations (SUPABASE_SERVICE_ROLE_KEY)
- **Fallback**: Backend falls back to anon key if service role not available

### State Management
- **Frontend**: React hooks + sessionStorage for user data; local component state where appropriate
- **AdminDashboard**: React Context API (AdminContext.jsx) for shared admin state

### Page Navigation
- **Frontend**: React Router v7 with scroll-to-top handler and hash-based section navigation
- **AdminDashboard**: Sidebar-based navigation with layout wrapper (AdminLayout.jsx)

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=<url>
SUPABASE_ANON_KEY=<key>
SUPABASE_SERVICE_ROLE_KEY=<key>
PORT=5000
TWILIO_ACCOUNT_SID=<sid>
TWILIO_AUTH_TOKEN=<token>
TWILIO_PHONE_NUMBER=<number>
NODEMAILER_EMAIL=<email>
NODEMAILER_PASSWORD=<password>
```

### Frontend (.env)
```
VITE_SUPABASE_URL=<url>
VITE_SUPABASE_ANON_KEY=<key>
```

### AdminDashboard (.env)
```
VITE_SUPABASE_URL=<url>
VITE_SUPABASE_ANON_KEY=<key>
```

## Important Notes

### CORS Configuration
- Backend currently has CORS enabled for all origins (`origin: '*'`)
- Before production deployment, update CORS in `Backend/server.js` to include specific frontend URLs

### Port Management
- Frontend dev: port 5173 (Vite default)
- AdminDashboard dev: port 5173 (Vite default - may conflict with Frontend if both run on same machine)
- Backend: port 5000

### Database & Testing
- Several helper scripts exist in Backend/ for database inspection (check_db.js, list_all_listings.js, etc.)
- Use these to verify schema and data integrity during development

### Git Status
- Track file `Backend/drafts.json` - contains draft listing data

## Development Tips

1. **Proxy Configuration**: Frontend Vite proxy automatically routes API calls to backend; ensure backend is running for API features
2. **Hot Module Replacement**: Vite enables HMR for both frontends during development
3. **Console Logging**: Backend logs Supabase connection status on startup
4. **Password/Config Changes**: Clear browser sessionStorage if auth behavior changes
5. **Component Reuse**: Check `components/` directories before creating new components - significant UI overlap between Frontend and AdminDashboard
