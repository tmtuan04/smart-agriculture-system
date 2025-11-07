# Smart Agriculture System - Backend

## Overview
Backend của hệ thống được xây dựng hoàn toàn trên **Firebase**, đảm nhiệm các chức năng:
- Quản lý người dùng (đăng ký, đăng nhập, phân quyền)
- Lưu trữ và xử lý dữ liệu thiết bị/sensor
- Thống kê và gửi thông báo tự động (qua Firebase Cloud Functions)
- Giao tiếp real-time với thiết bị thông qua **MQTT**

---

## Firebase Services Used

### 1. **Firebase Firestore**
- Cơ sở dữ liệu NoSQL dạng **document - collection**.  
- Dùng để lưu trữ dữ liệu người dùng, thiết bị và dữ liệu cảm biến.  
- Hỗ trợ realtime update, dễ mở rộng và tích hợp với Cloud Functions.

### 2. **Firebase Authentication**
- Xác thực người dùng qua email/password hoặc token.  
- Bảo mật truy cập API và quản lý quyền user.

### 3. **Firebase Cloud Functions**
- Xử lý logic backend (API, trigger khi có thay đổi trong Firestore).  
- Ví dụ: Khi thiết bị gửi dữ liệu mới → trigger lưu vào Firestore → cập nhật dashboard.

### 4. **Firebase Cloud Messaging (FCM)**
- Gửi thông báo real-time đến app hoặc dashboard khi có sự kiện (ví dụ: cảm biến vượt ngưỡng).