# E-commerce Backend API

Backend API cho **Hệ Thống Đặt Hàng và Quản Lý Đơn Hàng Trực Tuyến**. Xây dựng trên NestJS + TypeORM + MySQL.

## Tech Stack

- **Framework**: NestJS 11
- **Database**: MySQL 8 (Docker) + TypeORM
- **Auth**: JWT (Passport) + bcrypt
- **Logging**: Winston + Daily Rotate File
- **Docs**: Swagger/OpenAPI
- **Security**: Helmet, CORS whitelist, Rate Limiting (Throttler)

## Yêu Cầu

- Node.js >= 18
- Docker Desktop (cho MySQL)
- npm

## Cài Đặt

```bash
# 1. Clone project
git clone <repo-url>
cd backend

# 2. Install dependencies
npm install

# 3. Tạo file .env (copy từ mẫu bên dưới)
cp .env.example .env

# 4. Start MySQL via Docker
docker-compose up -d

# 5. Seed dữ liệu mẫu (categories + products)
npm run seed

# 6. Start development server
npm run start:dev
```

## Environment Variables

Tạo file `.env` tại root với nội dung:

```env
# Database
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=ecommerce_db

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=30m

# App
PORT=3000
LOG_LEVEL=debug

# Frontend URL (cho CORS)
FRONTEND_URL=http://localhost:5173
```

## Chạy Server

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod

# Seed data
npm run seed
```

## API Documentation

Swagger UI: **http://localhost:3000/api/docs**

### Tổng quan API (37 endpoints)

| Nhóm | Endpoints | Mô tả |
|------|-----------|-------|
| Auth | 6 | Register, Login, Refresh, Logout, Forgot/Reset Password |
| Users | 3 | Profile, Update, Change Password |
| Products | 2 | List (filter/sort/search), Detail |
| Categories | 1 | List |
| Cart | 5 | Get, Add, Update, Remove, Clear |
| Orders | 4 | Create, List, Detail, Cancel |
| Admin - Products | 4 | CRUD + Image management |
| Admin - Categories | 3 | CRUD |
| Admin - Orders | 4 | List, Detail, Update Status, Stats |
| Admin - Users | 5 | List, Detail, Update Status/Role |

### Authentication

Tất cả API (trừ Auth, Products, Categories) yêu cầu Bearer JWT token:

```
Authorization: Bearer <access_token>
```

Admin APIs yêu cầu user có `role: "admin"`.

## Cấu Trúc Project

```
src/
├── auth/           # Authentication (JWT, Guards)
├── users/          # User management
├── products/       # Products + Images
├── categories/     # Categories
├── cart/           # Shopping cart
├── orders/         # Orders + Status History
├── common/
│   ├── entities/   # Base entity (id, createdAt, updatedAt)
│   ├── filters/    # Global HTTP exception filter
│   ├── interceptors/ # Logging interceptor
│   └── logger/     # Winston logger service
└── database/
    └── seeds/      # Seed data (categories + products)
```

## Security

- **Helmet** — HTTP security headers
- **CORS** — Whitelist origins (localhost:3000, 3001, 5173)
- **Rate Limiting** — 100 requests / 60 giây
- **Validation** — class-validator + whitelist mode
- **Password** — bcrypt hash (10 rounds)

## Database

- **ORM**: TypeORM với MySQL
- **Indexes**: Tối ưu queries trên User, Order, Product, ProductImage
- **Transactions**: Pessimistic locking cho Cart và Order (tránh oversell)
- **Migration**: Sử dụng `synchronize: true` (development only)
