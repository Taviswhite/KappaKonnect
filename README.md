# KappaKonnect

A modern fraternity management portal built with React, TypeScript, and Supabase. Manage events, members, tasks, attendance, and more in one centralized platform.

## 🚀 Features

- **Member Management** - Track active members, alumni, and roles
- **Event Management** - Create and manage chapter events
- **Task Management** - Assign and track tasks with due dates
- **Attendance System** - QR code-based attendance tracking
- **Document Management** - Store and organize chapter documents
- **Real-time Chat** - Communicate with chapter members
- **Notifications** - Stay updated with chapter activities
- **Role-based Access** - Admin, E-Board, committee chair, and member roles

## 🛠️ Technologies

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Routing**: React Router v7
- **Forms**: React Hook Form, Zod validation

## 📋 Prerequisites

- Node.js 18+ and npm (or yarn/bun)
- Supabase account and project
- Git

## 🏃 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Taviswhite/KappaKonnect.git
cd KappaKonnect
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

**Where to find these values:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

### 4. Set Up Database

Run the migration file in your Supabase project:
- Navigate to SQL Editor in Supabase
- Run the migration from `supabase/migrations/20260113013210_remix_migration_from_pg_dump.sql`

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without emitting files
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── integrations/       # Third-party integrations (Supabase)
├── lib/                # Utility functions
├── pages/              # Page components
└── routes.tsx          # Route configuration
```

## 🔐 Authentication

The app uses Supabase Authentication with email/password. Users can:
- Sign up for new accounts
- Sign in with existing credentials
- Access protected routes based on authentication status

## 👥 User Roles

- **Admin** - Full access to all features
- **E-Board** - Access to sensitive statistics and management features
- **Committee Chair** - Access to committee-specific features
- **Member** - Standard member access
- **Advisor** - Advisor-level access

## 🐛 Troubleshooting

### Port Already in Use
If port 8080 is in use, Vite will automatically use the next available port. Check terminal output for the actual port.

### Environment Variables Not Working
- Ensure `.env` file is in the root directory
- Restart dev server after changing `.env`
- Variable names must start with `VITE_`

### Supabase Connection Errors
- Verify Supabase URL and key are correct
- Check that your Supabase project is active
- Ensure database tables are created (run migrations)

### Module Not Found Errors
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📦 Deployment

### Build for Production

```bash
npm run build
```

The `dist` folder will contain the production-ready files.

### Deploy to Vercel/Netlify

1. Connect your repository
2. Set environment variables in the platform's dashboard
3. Deploy!

The build process will automatically validate environment variables.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` and `npm run type-check`
5. Submit a pull request

## 📝 License

This project is private and proprietary.

## 🔗 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Vite Documentation](https://vitejs.dev)

---

**Note**: Make sure to configure Row Level Security (RLS) policies in Supabase for proper data access control.

