# Multi-Tenant SaaS Notes Application

A complete multi-tenant SaaS application built with Next.js, featuring user authentication, tenant isolation, and subscription-based note limits.

## 🏗️ **PROJECT STRUCTURE - IMPORTANT FOR DEPLOYMENT**

**⚠️ FOLDER CONFUSION RESOLVED:**

This project contains multiple folders from previous development stages. **Here's what to use:**

### ✅ **CORRECT FOLDER FOR DEPLOYMENT:**
- **`frontend/`** - This is the main Next.js application to deploy to Vercel
  - Contains API routes (`frontend/src/app/api/`)
  - Contains React pages and components
  - Has proper `package.json`, `next.config.js`, and `vercel.json`
  - **This is the only folder you need for deployment!**

### ❌ **IGNORE THESE FOLDERS:**
- **`backend/`** - Old Express backend (not needed)
- **`client/`** - Old React client (not needed) 
- **`server/`** - Old server setup (not needed)
- Root level files - Legacy files from previous structure

## 🚀 **VERCEL DEPLOYMENT GUIDE**

### **Step 1: Prepare for Deployment**

1. **Security First** - Rotate your MongoDB credentials immediately:
   - Go to MongoDB Atlas
   - Create new database user credentials
   - Delete the old exposed credentials

2. **Navigate to the correct folder:**
   ```bash
   cd frontend
   ```

### **Step 2: Vercel Deployment Options**

#### **Option A: Deploy via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow prompts and set root directory to current folder
```

#### **Option B: Deploy via Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Connect your Git repository
3. **IMPORTANT:** Set the root directory to `frontend`
4. Vercel will auto-detect Next.js settings

### **Step 3: Configure Environment Variables in Vercel**

In Vercel Dashboard → Settings → Environment Variables, add:

```
MONGODB_URI=mongodb+srv://your_new_user:your_new_password@cluster.mongodb.net/noteshub
JWT_SECRET=your_super_secure_random_jwt_secret_key_here_minimum_32_characters
```

### **Step 4: Build Settings (Auto-configured)**

Vercel automatically detects Next.js and uses:
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Root Directory:** `frontend` (set this manually)

## 📁 **DETAILED FOLDER EXPLANATION**

```
project-root/
├── frontend/          ← DEPLOY THIS FOLDER TO VERCEL
│   ├── src/app/api/   ← Backend API routes
│   ├── src/app/       ← Frontend pages  
│   ├── package.json   ← Dependencies
│   ├── next.config.js ← Next.js config
│   └── vercel.json    ← Vercel config
├── backend/           ← IGNORE - Old Express backend
├── client/            ← IGNORE - Old React client
├── server/            ← IGNORE - Old server setup
└── README.md          ← This file
```

## 🔧 **FEATURES**

- **Multi-tenant Architecture**: Complete tenant isolation
- **Role-based Access Control**: Admin and Member roles
- **Subscription Management**: Free (3 notes) vs Pro (unlimited)
- **JWT Authentication**: Secure token-based auth
- **MongoDB Integration**: Scalable database
- **Responsive Design**: Modern UI with Tailwind CSS

## 🧪 **TEST ACCOUNTS**

**Acme Corp Tenant:**
- Admin: `admin@acme.test` / `password`
- Member: `user@acme.test` / `password`

**Globex Corporation Tenant:**
- Admin: `admin@globex.test` / `password`
- Member: `user@globex.test` / `password`

## 🛠️ **LOCAL DEVELOPMENT**

```bash
# Navigate to the correct directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and JWT secret

# Run development server
npm run dev

# Visit http://localhost:3000
```

## 🔒 **SECURITY NOTES**

- **CRITICAL:** MongoDB credentials were temporarily exposed and must be rotated
- JWT secrets should be minimum 32 characters random string
- Never commit credentials to version control
- Use environment variables for all secrets

## 📡 **API ENDPOINTS**

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Notes Management
- `GET /api/notes` - Get notes (tenant isolated)
- `POST /api/notes` - Create note
- `GET /api/notes/[id]` - Get specific note
- `PUT /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

### User & Subscription
- `GET /api/user` - Get current user
- `POST /api/tenants/[slug]/upgrade` - Upgrade to Pro

## 🎯 **DEPLOYMENT CHECKLIST**

- [ ] Rotate MongoDB credentials
- [ ] Set Vercel root directory to `frontend`
- [ ] Configure environment variables in Vercel
- [ ] Test the deployed application
- [ ] Verify tenant isolation works
- [ ] Test subscription limits

## 📊 **DATABASE SCHEMA**

### Users Collection
```javascript
{
  email: String,
  password: String, // bcrypt hashed
  role: "admin" | "member", 
  tenantId: String,
  createdAt: Date
}
```

### Tenants Collection
```javascript
{
  name: String,
  slug: String,
  plan: "free" | "pro",
  createdAt: Date
}
```

### Notes Collection
```javascript
{
  title: String,
  content: String,
  userId: String,
  tenantId: String, // Ensures tenant isolation
  createdAt: Date
}
```

---

**🚨 REMEMBER:** Only deploy the `frontend/` folder to Vercel. All other folders are legacy and should be ignored!