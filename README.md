# Foundation Backend

Standalone Node.js & PostgreSQL backend powered by Express, TypeScript, and Prisma ORM.

---

## 🛠 Features

- **Runtime**: Node.js (v20+) with TypeScript
- **Web Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma ORM v6
- **Dev Runner**: `tsx watch` (instant reload, zero build configuration)
- **CORS**: Configured to communicate with frontend at `http://localhost:3000`

---

## 📂 Project Structure

```text
backend/
├── prisma/
│   └── schema.prisma         # Database schema definition
├── src/
│   ├── config/
│   │   └── env.ts            # Environment variable configuration
│   ├── db/
│   │   ├── client.ts         # Prisma client instance
│   │   └── seed.ts           # Initial database seeder
│   ├── middleware/
│   │   ├── errorHandler.ts   # Centralized error handler
│   │   └── requestLogger.ts  # HTTP request logger
│   ├── routes/
│   │   ├── health.ts         # /api/health endpoint (checks DB)
│   │   ├── users.ts          # /api/users CRUD endpoints
│   │   └── index.ts          # Master API router
│   └── index.ts              # Express application entry point
├── .env.example              # Sample environment template
├── .env.local                # Local environment configuration (Neon CLI)
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Database
For Neon, run `neon init` and `neon deploy`; the CLI writes connection variables
to `.env.local`. The app loads `.env.local` before `.env`. For a manually
configured PostgreSQL database, set both connection strings:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/foundation_db?schema=public"
```
Use the pooled `DATABASE_URL` for app traffic and the direct
`DATABASE_URL_UNPOOLED` for Prisma schema operations.

When configuring variables manually, set `DATABASE_URL_UNPOOLED` to the direct
PostgreSQL connection string. Neon CLI populates both URLs automatically.

### 3. Generate Prisma Client & Push Schema
```bash
# Push the schema to your PostgreSQL database
npm run db:push

# Generate client types
npm run db:generate

# (Optional) Seed the database with sample data
npm run db:seed
```

### 4. Start the Development Server
```bash
npm run dev
```

The server starts at `http://localhost:5000`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and root info |
| `GET` | `/api/health` | Service health & PostgreSQL connectivity |
| `GET` | `/api/users` | List all users with post counts |
| `GET` | `/api/users/:id` | Get specific user by ID |
| `POST` | `/api/users` | Create a new user (`{ email, name }`) |
| `DELETE` | `/api/users/:id` | Delete user by ID |

---

## 🗄 Useful Prisma Commands

- `npm run db:studio` - Launch Prisma Studio visual browser at `http://localhost:5555`
- `npm run db:migrate` - Create and apply SQL migrations for production
