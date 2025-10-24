# 🛍️ E-COMMERCE MICROSERVICES PROJECT

**Sinh viên:** Nguyễn Ngọc Hồng Linh  
**MSSV:** 22649491  
**Project:** Hệ thống E-Commerce với Microservices Architecture

---

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
3. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
4. [Cài đặt](#cài-đặt)
5. [Chạy project](#chạy-project)
6. [Test với Postman](#test-với-postman)
7. [API Documentation](#api-documentation)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Tổng quan

Đây là hệ thống E-Commerce được xây dựng theo **Microservices Architecture**, bao gồm:

- **Auth Service** - Quản lý xác thực người dùng (JWT)
- **Product Service** - Quản lý sản phẩm
- **Order Service** - Xử lý đơn hàng qua RabbitMQ
- **API Gateway** - Single entry point cho toàn hệ thống

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────┐
│   Client    │
│  (Postman)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│         API Gateway (Port 3003)         │
│     (Optional - Direct access OK)       │
└────────┬──────────────┬─────────────────┘
         │              │
    ┌────▼────┐    ┌────▼──────┐
    │  Auth   │    │  Product  │
    │ Service │    │  Service  │
    │  :3000  │    │   :3001   │
    └────┬────┘    └────┬──────┘
         │              │
         │         ┌────▼────────┐
         │         │  RabbitMQ   │
         │         │   :5672     │
         │         └────┬────────┘
         │              │
         │         ┌────▼────┐
         │         │  Order  │
         │         │ Service │
         │         │  :3002  │
         ▼         └─────────┘
    ┌─────────┐
    │ MongoDB │
    │ :27017  │
    └─────────┘
```

---

## 💻 Công nghệ sử dụng

### Backend
- **Node.js** + **Express.js** - Web framework
- **MongoDB** + **Mongoose** - Database
- **RabbitMQ** (AMQP) - Message broker
- **JWT** - Authentication
- **Docker** + **Docker Compose** - Containerization

### Testing
- **Mocha** - Test framework
- **Chai** - Assertion library
- **Postman** - API testing

---

## 📦 Cài đặt

### Yêu cầu hệ thống
- **Node.js** >= 14.x
- **Docker Desktop** (for Windows/Mac) hoặc **Docker Engine** (for Linux)
- **MongoDB** (hoặc dùng Docker)
- **Postman** (để test API)

### Bước 1: Clone project
```bash
git clone https://github.com/HongLinh1103/22649491-NguyenNgochongLinh-EProject.git
cd 22649491-NguyenNgochongLinh-EProject
```

### Bước 2: Install dependencies
```bash
# Root dependencies
npm install

# Auth service
cd auth
npm install

# Product service
cd ../product
npm install

# Order service
cd ../order
npm install

# API Gateway (optional)
cd ../api-gateway
npm install
```

### Bước 3: Cấu hình Environment Variables

Đã có sẵn các file `.env` trong mỗi service:

**auth/.env:**
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/authdb
JWT_SECRET=supersecret
```

**product/.env:**
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/productdb
RABBITMQ_URL=amqp://guest:guest@localhost:5672
JWT_SECRET=supersecret
```

**order/.env:**
```
PORT=3002
MONGODB_URI=mongodb://localhost:27017/orderdb
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

---

## 🚀 Chạy project

### Cách 1: Sử dụng Script tự động (Khuyến nghị)

**Windows:**
```bash
# Khởi động tất cả services
start-all-services.bat

# Dừng tất cả services
stop-all-services.bat
```

### Cách 2: Chạy thủ công

**Bước 1: Khởi động Docker**
```bash
docker-compose up -d
```

**Bước 2: Khởi động các services** (mỗi service một terminal)

```bash
# Terminal 1 - Auth Service
cd auth
node index.js

# Terminal 2 - Product Service
cd product
node index.js

# Terminal 3 - Order Service
cd order
node index.js

# Terminal 4 - API Gateway (optional)
cd api-gateway
node index.js
```

### Kiểm tra services đang chạy

```bash
# Kiểm tra Docker containers
docker ps

# Kiểm tra Node.js processes (Windows)
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3002
```

---

## 🧪 Test với Postman

### Quick Start

1. **Import Postman Collection**
   - Mở Postman
   - Import file: `E-Commerce_Microservices.postman_collection.json`


3. **Test Flow cơ bản**
   ```
   Register → Login → Create Products → Get Products → Buy Products
   ```

### Run Automated Tests

```bash
npm test
```

Kết quả mong đợi: **7 passing tests**
- Auth Service: 5 tests
- Product Service: 2 tests

---

## 📚 API Documentation

### Auth Service (Port 3000)

#### POST /register
Đăng ký tài khoản mới
```json
Request:
{
  "username": "honglinh",
  "password": "password123"
}

Response (200):
{
  "_id": "...",
  "username": "honglinh"
}
```

#### POST /login
Đăng nhập và nhận JWT token
```json
Request:
{
  "username": "honglinh",
  "password": "password123"
}

Response (200):
{
  "token": "eyJhbGc..."
}
```

#### GET /dashboard
Truy cập trang protected (cần token)
```
Headers:
Authorization: Bearer <token>

Response (200):
{
  "message": "Welcome to dashboard"
}
```

### Product Service (Port 3001)

#### POST /api/products
Tạo sản phẩm mới (cần token)
```json
Headers:
Authorization: Bearer <token>

Request:
{
  "name": "iPhone 15 Pro Max",
  "description": "Flagship smartphone",
  "price": 1200
}

Response (201):
{
  "_id": "...",
  "name": "iPhone 15 Pro Max",
  "description": "Flagship smartphone",
  "price": 1200
}
```

#### GET /api/products
Lấy danh sách sản phẩm (cần token)
```
Headers:
Authorization: Bearer <token>

Response (200):
[
  {
    "_id": "...",
    "name": "iPhone 15 Pro Max",
    "price": 1200
  }
]
```

#### POST /api/products/buy
Mua sản phẩm / Tạo đơn hàng (cần token)
```json
Headers:
Authorization: Bearer <token>

Request:
{
  "ids": ["product_id_1", "product_id_2"]
}

Response (201):
{
  "status": "completed",
  "products": [...],
  "username": "honglinh",
  "totalPrice": 3700
}
```

---

## 🔧 Troubleshooting

### Lỗi "ECONNREFUSED"
- Kiểm tra service có chạy không
- Kiểm tra port đã bị chiếm chưa
- Restart service

### Lỗi "Unauthorized" (401)
- Token không hợp lệ hoặc đã hết hạn
- Login lại để lấy token mới
- Kiểm tra JWT_SECRET trong .env files

### Lỗi MongoDB connection
- Kiểm tra MongoDB đang chạy
- Kiểm tra connection string
- Thử restart MongoDB

### Lỗi RabbitMQ connection
- Kiểm tra Docker: `docker ps`
- Restart RabbitMQ: `docker-compose restart rabbitmq`
- Truy cập UI: http://localhost:15672 (guest/guest)

### Order không complete
- Kiểm tra Order service có chạy
- Kiểm tra RabbitMQ connection
- Xem logs ở terminal Order service

---

## 📊 Monitoring & Debugging

### RabbitMQ Management UI
- URL: http://localhost:15672
- Login: guest / guest
- Kiểm tra queues: `orders`, `products`

### MongoDB
```bash
# Kết nối MongoDB
mongosh

# Xem databases
show dbs

# Kiểm tra data
use authdb
db.users.find().pretty()

use productdb
db.products.find().pretty()

use orderdb
db.orders.find().pretty()
```

### Logs
- Xem terminal của từng service
- Auth service: Port 3000 logs
- Product service: Port 3001 logs
- Order service: Port 3002 logs

---

## 📂 Cấu trúc Project

```
.
├── auth/                       # Auth microservice
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── test/
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── product/                    # Product microservice
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── test/
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── order/                      # Order microservice
│   ├── src/
│   │   ├── models/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── config.js
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── api-gateway/                # API Gateway
│   ├── index.js
│   └── package.json
│
├── docker-compose.yml          # Docker configuration
├── package.json               # Root dependencies
├── start-all-services.bat     # Startup script
├── stop-all-services.bat      # Shutdown script
├── E-Commerce_Microservices.postman_collection.json
├── POSTMAN_TESTING_GUIDE.md
├── QUICK_START_POSTMAN.md
└── README.md
```

---

## 🎓 Tính năng chính

✅ **Microservices Architecture** - Services độc lập, dễ scale  
✅ **JWT Authentication** - Bảo mật API endpoints  
✅ **Event-Driven Architecture** - RabbitMQ message broker  
✅ **API Gateway Pattern** - Single entry point  
✅ **Repository Pattern** - Clean code architecture  
✅ **Unit Testing** - Mocha + Chai  
✅ **Docker Support** - Easy deployment  
✅ **RESTful API** - Standard API design  

---

## 📄 License

This project is for educational purposes.

---

## 👨‍💻 Author

**Nguyễn Ngọc Hồng Linh**  
MSSV: 22649491  
GitHub: [@HongLinh1103](https://github.com/HongLinh1103)

---

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra [Troubleshooting](#troubleshooting)
2. Xem logs ở terminal
3. Kiểm tra RabbitMQ Management UI
4. Kiểm tra MongoDB data

---

**Happy Coding! 🚀**
