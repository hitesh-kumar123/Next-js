# 🌐 Nexus Control & Branding Platform

A state-of-the-art Web Application Workspace built using Next.js 16 (React 19), Apollo GraphQL, Redux Toolkit, and NextAuth. This dashboard manages organizational security rules, authorization interceptors, real-time analytics, and role-based access controls (RBAC).

---

## 🚀 Tech Stack

- **Core Framework**: [Next.js 16 (App Router)](https://nextjs.org/) & React 19
- **GraphQL APIs**: [GraphQL Yoga](https://the-guild.dev/graphql/yoga) (with Subscription pipeline support)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Authentication**: [NextAuth.js v4](https://next-auth.js.org/) (Credentials Provider)
- **Styling & UI**: TailwindCSS v4, Framer Motion, and Lucide React
- **Charts**: [Recharts](https://recharts.org/)
- **Database**: Mongoose (MongoDB connection setup)

---

## 🔑 Access Control & RBAC System

This application implements **Role-Based Access Control (RBAC)** to restrict features based on the logged-in operator's role.

For complete login credentials and details on what each role can and cannot do, check out the **[RBAC System Guide](./RBAC_GUIDE.md)**.

### Quick Login Accounts:
- **Admin**: `admin@platform.com` / `password`
- **Editor**: `editor@platform.com` / `password`
- **Viewer**: `viewer@platform.com` / `password`

---

## 🛠️ Getting Started

### 1. Configure Environment Variables
Create a `.env.local` file in the root directory (or copy from existing templates) and configure:
```env
MONGODB_URI=your_mongodb_connection_uri
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
