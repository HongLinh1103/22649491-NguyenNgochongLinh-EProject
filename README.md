
# E-COMMERCE MICROSERVICES — TÓM TẮT & HƯỚNG DẪN TEST

**Sinh viên:** Nguyễn Ngọc Hồng Linh

**MSSV:** 22649491

---

## 1. Tổng quan ngắn

Ứng dụng E‑commerce mẫu minh họa kiến trúc microservices: người dùng đăng ký/đăng nhập (Auth), quản lý sản phẩm (Product), xử lý đơn hàng bất đồng bộ (Order) qua RabbitMQ, và API Gateway làm điểm vào chung.

---

## 2. Kiến trúc hệ thống

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

## 3. Trả lời 5 yêu cầu chính

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

## 4. Quick start (chạy nhanh)

Chạy toàn bộ bằng Docker (khuyến nghị cho buổi demo):

```powershell
# ở thư mục gốc project
docker-compose up -d --build
docker ps
```


---

## 5. Hướng dẫn test bằng Postman (chi tiết, step-by-step)

Chuẩn bị trong Postman:

- Import collection: `E-Commerce_Microservices.postman_collection.json` 
- Flow test (thực hiện theo thứ tự):

1) Tạo tài khoản (Register)

- Method: POST
- URL: `http://localhost:3003/auth/register`
- Body (raw JSON):

```json
{
  "username": "student01",
  "password": "pass123"
}
```

2) Đăng nhập (Login) — lấy JWT

- Method: POST
- URL: `http://localhost:3003/auth/login`
- Body: giống trên
- Nhấn **Send** để gửi request. 
- Response: `{ "token": "<JWT>" }`
**⚠️ Quan trọng:** Copy token này để sử dụng cho bước tiếp theo!

3) Tạo sản phẩm (Create Product)

- Method: POST
- URL: `http://localhost:3003/products/api/products`
- Headers: Vào tab **Authorization** -> Chọn **Auth Type** là **Bearer Token**
- Nhập mã Token vừa copy ở bước đăng nhập vào ô
- Body:

```json
{
  "name": "Sample Product",
  "price": 9.99,
  "description": "Test product"
}
```
- Nhấn **Send** để gửi request. 


4) Lấy sản phẩm theo id (Get Product)

- Method: GET
- URL: `http://localhost:3003/products/api/products/{{productId}}`
- Headers: Vào tab **Authorization** -> Chọn **Auth Type** là **Bearer Token**
- Nhập mã Token vừa copy ở bước đăng nhập vào ô
- Nhấn **Send** để gửi request. 

5) Đặt hàng (Buy)

- Method: POST
- URL: `http://localhost:3003/products/api/products/buy`
- Headers: Vào tab **Authorization** -> Chọn **Auth Type** là **Bearer Token**
- Nhập mã Token vừa copy ở bước đăng nhập vào ô
- Body:

```json
{
  "ids": ["{{productId}}"]
}
```
- Nhấn **Send** để gửi request. 

---

## 6. Kiểm tra & troubleshooting nhanh

- Unit tests: `npm test` (root hoặc trong từng service). Kết quả mong đợi: 7 passing.
- Kiểm tra Docker: `docker ps` (ports: 3000..3003, 5672, 15672, 27017).
- RabbitMQ UI: http://localhost:15672 (guest/guest) — kiểm tra queues `orders`, `products`.

---






