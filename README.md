# E-COMMERCE MICROSERVICES — TÓM TẮT & HƯỚNG DẪN TEST

**Sinh viên:** Nguyễn Ngọc Hồng Linh

**MSSV:** 22649491

---

## 1. Tổng quan ngắn

Ứng dụng E‑commerce mẫu minh họa kiến trúc microservices: người dùng đăng ký/đăng nhập (Auth), quản lý sản phẩm (Product), xử lý đơn hàng bất đồng bộ (Order) qua RabbitMQ, và API Gateway làm điểm vào chung.

---

## 2. Kiến trúc hệ thống (sơ đồ)

```mermaid
flowchart LR
  Client[Client (Postman / Browser)] --> Gateway(API Gateway\nport 3003)
  Gateway --> Auth[Auth Service\nport 3000]
  Gateway --> Product[Product Service\nport 3001]
  Gateway --> Order[Order Service\nport 3002]
  Product -->|AMQP publish orders| Rabbit[RabbitMQ]
  Order -->|AMQP consume orders| Rabbit
  Auth --> MongoA[(MongoDB authdb)]
  Product --> MongoP[(MongoDB productdb)]
  Order --> MongoO[(MongoDB orderdb)]
```

> Ghi chú: Khi chạy trong Docker Compose, gateway route tới `http://auth:3000`, `http://product:3001`, `http://order:3002` (tên container làm hostname).

---

## 3. Trả lời 5 yêu cầu chính

1) Hệ thống giải quyết vấn đề gì?

- Hệ thống là một bản demo thương mại điện tử: đăng ký/đăng nhập, quản lý sản phẩm, và xử lý đặt hàng với minh họa luồng bất đồng bộ.

2) Hệ thống có bao nhiêu dịch vụ?

- 4 dịch vụ chính: Auth (3000), Product (3001), Order (3002), API Gateway (3003).

3) Ý nghĩa / chức năng từng dịch vụ

- Auth Service: đăng ký, đăng nhập, cấp JWT và xác thực.
- Product Service: CRUD sản phẩm, endpoint GET /api/products/:id, publish yêu cầu đặt hàng.
- Order Service: consume messages từ queue `orders`, xử lý đơn và publish kết quả/ack nếu cần.
- API Gateway: proxy/route requests từ client tới các service bên trong.

4) Các mẫu thiết kế sử dụng

- Microservices, API Gateway pattern, Event-driven (RabbitMQ), JWT-based stateless authentication.

5) Các dịch vụ giao tiếp như thế nào?

- HTTP REST (client → API Gateway → services) cho thao tác đồng bộ.
- AMQP (RabbitMQ) cho giao tiếp bất đồng bộ giữa Product và Order. Mỗi service dùng MongoDB riêng (db per service).

---

## 4. Quick start (chạy nhanh)

```powershell
# ở thư mục gốc project
docker-compose up -d --build
docker ps
```



---

## 5. Hướng dẫn test bằng Postman (chi tiết, step-by-step)

Chuẩn bị trong Postman:

- Import collection: `E-Commerce_Microservices.postman_collection.json` (đã có trong repo).
- Tạo environment `local` với biến:
  - `baseUrl` = `http://localhost:3003` (sử dụng API Gateway) — nếu gọi trực tiếp service thay đổi cho phù hợp.

Flow test (thực hiện theo thứ tự):

1) Tạo tài khoản (Register)

- Method: POST
- URL: `{{baseUrl}}/auth/register`
- Body (raw JSON):

```json
{
  "username": "student01",
  "password": "pass123"
}
```

2) Đăng nhập (Login) — lấy JWT

- Method: POST
- URL: `{{baseUrl}}/auth/login`
- Body: giống trên
- Response: `{ "token": "<JWT>" }`
- Trong Postman: tạo biến `authToken` và lưu giá trị `Bearer <JWT>` (bao gồm từ khóa `Bearer`).

3) Tạo sản phẩm (Create Product)

- Method: POST
- URL: `{{baseUrl}}/products/api/products`
- Headers: `Authorization: {{authToken}}`, `Content-Type: application/json`
- Body:

```json
{
  "name": "Sample Product",
  "price": 9.99,
  "description": "Test product"
}
```
- Lưu `productId` từ response vào biến môi trường `productId`.

4) Lấy sản phẩm theo id (Get Product)

- Method: GET
- URL: `{{baseUrl}}/products/api/products/{{productId}}`
- Headers: `Authorization: {{authToken}}`

5) Đặt hàng (Buy)

- Method: POST
- URL: `{{baseUrl}}/products/api/products/buy`
- Headers: `Authorization: {{authToken}}`, `Content-Type: application/json`
- Body:

```json
{
  "ids": ["{{productId}}"]
}
```

- Kết quả: endpoint có thể sử dụng long-polling; mong đợi kết quả `status: completed` khi Order Service xử lý xong.

Tips nhanh trong Postman:

- Tạo Pre-request script (nếu muốn tự set `authToken` từ response login). Có thể dùng Tests tab trong request login để `pm.environment.set("authToken", "Bearer " + pm.response.json().token)`.
- Sử dụng variables: `baseUrl`, `authToken`, `productId` để chạy thao tác nhanh.

---

## 6. Kiểm tra & troubleshooting nhanh

- Unit tests: `npm test` (root hoặc trong từng service). Kết quả mong đợi: 7 passing.
- Kiểm tra Docker: `docker ps` (ports: 3000..3003, 5672, 15672, 27017).
- RabbitMQ UI: http://localhost:15672 (guest/guest) — kiểm tra queues `orders`, `products`.

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



1) Hệ thống giải quyết vấn đề gì?

- Đây là một ứng dụng thương mại điện tử mẫu (E‑commerce). Hệ thống cho phép người dùng đăng ký/đăng nhập, quản lý sản phẩm và thực hiện đặt hàng. Mục tiêu chính là minh họa kiến trúc microservices, xác thực bằng JWT và luồng xử lý đơn hàng bất đồng bộ qua RabbitMQ.

2) Hệ thống có bao nhiêu dịch vụ?

- Hệ thống gồm 4 dịch vụ chính:
  - Auth Service (xác thực) — port 3000
  - Product Service (quản lý sản phẩm) — port 3001
  - Order Service (xử lý đơn hàng) — port 3002
  - API Gateway (proxy / entry point) — port 3003

3) Ý nghĩa / chức năng từng dịch vụ

- Auth Service: xử lý đăng ký, đăng nhập, cấp và xác thực JWT cho các yêu cầu bảo mật.
- Product Service: quản lý dữ liệu sản phẩm (tạo, liệt kê, lấy theo id), nhận yêu cầu mua và publish message lên queue orders.
- Order Service: consume các message từ queue orders, xử lý đơn hàng và publish kết quả/ack lên queue products (hoặc lưu trạng thái đơn hàng).
- API Gateway: làm điểm truy cập duy nhất cho client, chuyển tiếp request tới dịch vụ tương ứng (strip prefix và proxy).

4) Các mẫu thiết kế được sử dụng

- Microservices Architecture: tách dịch vụ theo trách nhiệm.
- API Gateway Pattern: điểm vào duy nhất cho client.
- Event-driven / Message Broker (RabbitMQ): giao tiếp bất đồng bộ giữa dịch vụ để xử lý đơn hàng.
- JWT-based stateless authentication: bảo mật endpoint bằng token.

5) Các dịch vụ giao tiếp như thế nào?

- Client → API Gateway → (HTTP REST) → các service (Auth/Product/Order) cho các thao tác đồng bộ.
- Product Service ↔ Order Service: giao tiếp bất đồng bộ qua RabbitMQ (publish/consume messages). MongoDB được dùng cho lưu trữ dữ liệu dịch vụ.

---

