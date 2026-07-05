# Learning IELTS Web 🎓

Một nền tảng học thuật toàn diện giúp học viên luyện tập IELTS, theo dõi tiến độ học tập, duy trì chuỗi ngày học tập (streak) và cạnh tranh trên bảng xếp hạng cùng cộng đồng.

## 🚀 Các Tính Năng Nổi Bật

*   **Xác Thực An Toàn (Firebase Auth):** Đăng nhập nhanh chóng và bảo mật qua tài khoản Google. Tự động đồng bộ thông tin tài khoản giữa client và server.
*   **Quản Lý Khóa Học & Bài Học:** Giao diện trực quan hiển thị danh sách khóa học, phân chia các bài học theo từng Tuần và Ngày rõ ràng.
*   **Chế Độ Tập Trung (Focus Mode):**
    *   Đồng hồ đếm ngược thông minh giúp rèn luyện tính kỷ luật.
    *   Hệ thống khóa xác nhận: Yêu cầu học viên phải hoàn thành ít nhất 50% thời gian bài học mới được phép đánh dấu "Hoàn thành".
    *   Hỗ trợ nhúng trực tiếp tài liệu PDF, Video Youtube, hoặc các học liệu ngoại vi ngay trên màn hình học.
*   **Game Hóa & Bảng Xếp Hạng (Gamification):**
    *   Ghi nhận số bài học đã hoàn thành và duy trì "Streak" (chuỗi ngày học liên tiếp).
    *   Bảng xếp hạng toàn cầu (Top 50) khích lệ tinh thần thi đua giữa các học viên.
*   **Dashboard Cá Nhân Hóa:** Lịch học trực quan tô màu theo trạng thái (Đã hoàn thành, Bỏ lỡ), thống kê tóm tắt tiến độ học tập.
*   **Giao Diện Hiện Đại (Glassmorphism):** Thiết kế cao cấp, mượt mà, tương thích hoàn hảo trên cả Desktop, Tablet và Mobile.

---

## 🛠️ Tech Stack

*   **Frontend:** React.js, Vite, Vanilla CSS.
*   **Backend:** Node.js, Express.js, Prisma ORM.
*   **Database:** PostgreSQL.
*   **Khác:** Firebase (Auth, Admin Storage), Docker.

---

## 🌍 Hướng Dẫn Triển Khai (Deploy Miễn Phí)

Dự án này được thiết kế tối ưu để có thể chia nhỏ và deploy hoàn toàn miễn phí trên 3 nền tảng Cloud hàng đầu hiện nay. Đảm bảo bạn đã push toàn bộ code lên một Private Repository trên GitHub trước khi thực hiện.

### 1. Database (PostgreSQL) -> Deploy lên [Neon.tech](https://neon.tech/)
Neon cung cấp Database Serverless cực nhanh và hoàn toàn miễn phí.
1. Đăng ký tài khoản Neon và tạo một Project mới.
2. Ngay tại trang Dashboard, sao chép chuỗi kết nối **PostgreSQL Connection String**.
3. Lưu chuỗi này lại để sử dụng làm `DATABASE_URL` cho Backend ở bước tiếp theo.

### 2. Backend (Node.js) -> Deploy lên [Render.com](https://render.com/)
Render là nền tảng tuyệt vời để chạy các ứng dụng Node.js hoặc Docker container.
1. Tạo tài khoản Render, chọn tạo mới **Web Service**.
2. Kết nối với GitHub Repository của bạn.
3. Thiết lập **Root Directory** là `backend` (hoặc để trống nếu bạn muốn Render đọc Dockerfile).
4. Thiết lập Build Command: `npm install && npx prisma generate && npx prisma db push`
5. Thiết lập Start Command: `node index.js`
6. Thêm các Biến Môi Trường (Environment Variables) sau:
   *   `DATABASE_URL`: *(Dán chuỗi kết nối lấy từ Neon ở Bước 1 vào đây)*
   *   `PORT`: `3000` (hoặc cổng bất kỳ)
7. Nhấn Deploy và chờ Render khởi chạy server. Sau khi xong, hãy copy URL của Backend (ví dụ: `https://my-ielts-backend.onrender.com`).

### 3. Frontend (React) -> Deploy lên [Vercel.com](https://vercel.com/)
Vercel là nền tảng số 1 hiện nay để hosting các ứng dụng React với tốc độ tải trang cực nhanh (CDN toàn cầu).
1. Đăng nhập Vercel, chọn **Add New Project**.
2. Import GitHub Repository của bạn.
3. Chọn **Root Directory** là `web`. Vercel sẽ tự động nhận diện đây là dự án Vite.
4. Mở phần Environment Variables và thêm:
   *   `VITE_BACKEND_URL`: *(Dán URL của Backend trên Render ở Bước 2 vào đây)*
5. Nhấn **Deploy**. Vercel sẽ tự động chạy build và cung cấp cho bạn một đường link website chạy chính thức.

---

## 💻 Hướng Dẫn Chạy Cục Bộ (Local Development)

Nếu bạn muốn chạy dự án ngay trên máy tính của mình bằng Docker:

1. Clone dự án về máy.
2. Mở Terminal tại thư mục gốc của dự án.
3. Chạy lệnh:
   ```bash
   docker-compose up --build -d
   ```
4. Truy cập Frontend tại `http://localhost:80` (hoặc `http://localhost`). Backend API sẽ chạy ngầm ở port `3000`, và PostgreSQL ở port `5432`.
