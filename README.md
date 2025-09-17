# NotesHub - Multi-Tenant SaaS Notes Application

A production-ready multi-tenant SaaS notes application built with Next.js (frontend) and Node.js/Express (backend), featuring JWT authentication, role-based access control, and MongoDB database with strict tenant isolation.

## 🏗️ Architecture Overview

### Multi-Tenancy Approach

This application implements a **shared schema with tenant isolation** pattern:

- **Shared Database**: All tenants share the same MongoDB database
- **Tenant Isolation**: Every document includes a `tenantId` field for strict data separation
- **Automatic Isolation**: Middleware ensures users can only access data from their own tenant
- **Zero Cross-Tenant Access**: Database queries are automatically scoped by `tenantId`

### Tech Stack

**Frontend (`frontend/` folder):**
- Next.js 14 with App Router
- React 18 with TypeScript
- Tailwind CSS for styling
- Axios for API communication
- JWT token management
- React Query for state management

**Backend (`backend/` folder):**
- Node.js with Express
- TypeScript
- MongoDB with Mongoose ODM
- JWT authentication
- bcrypt password hashing
- Helmet for security headers
- Rate limiting and CORS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB
- Environment variables configured

### Environment Variables

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
