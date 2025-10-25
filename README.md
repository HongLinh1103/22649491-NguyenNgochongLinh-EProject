# E-COMMERCE MICROSERVICES - TÓM TẮT CHÍNH

Sinh viên: Nguyễn Ngọc Hồng Linh

MSSV: 22649491

---

## Kiến trúc hệ thống (tóm tắt)

```
Client (Postman)
   |
   v
API Gateway (port 3003)
   |\
   | \__ /auth  -> Auth Service (3000)
   | \__ /products -> Product Service (3001)
   | \__ /orders -> Order Service (3002)
   |
   v
Infrastructure:
 - MongoDB (documents for auth/product/order)
 - RabbitMQ (message broker between Product <-> Order)
```

---

## Trả lời yêu cầu (gồm 5 mục)

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

