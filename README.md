# CTSV Activity Parser & Dashboard

A modern, fast web application that scrapes university student activity data (CTSV), caches it locally for high performance, and displays it via an interactive, responsive dashboard with rich data visualizations.

---

## ⚠️ Disclaimer / Tuyên bố miễn trừ trách nhiệm

> [!IMPORTANT]
> - **Mục đích học tập & nghiên cứu:** Dự án này được phát triển hoàn toàn vì mục đích học tập cá nhân, nghiên cứu kỹ thuật giao diện và tối ưu hóa trải nghiệm theo dõi rèn luyện sinh viên.
> - **Tính độc lập:** Dự án hoàn toàn độc lập và **không liên kết, không đại diện hoặc được ủy quyền** bởi Đại học Bách khoa Hà Nội (HUST) hay Ban Công tác Sinh viên (CTSV).
> - **Bảo mật & Trách nhiệm người dùng:** Người dùng tự chịu trách nhiệm về việc bảo mật thông tin đăng nhập, token cá nhân và tuân thủ các quy định sử dụng hệ thống của nhà trường. Vui lòng không spam hoặc gửi yêu cầu tần suất cao gây ảnh hưởng đến hệ thống máy chủ trường.

---

## 🚀 Features

- **5-Second DRL Dashboard:** Trực quan hóa điểm rèn luyện trong 5 giây với Hero Radial Score Gauge, phân loại chuẩn Bách khoa (Xuất sắc, Tốt, Khá, TB), thang mốc đạt chuẩn và thanh tiến độ 5 khung tiêu chí cốt lõi.
- **Left Sidebar Navigation:** Bố cục thanh bên tiện lợi, tích hợp nhập MSSV, đồng bộ dữ liệu nhanh và widget ĐRL thu nhỏ. Hỗ trợ responsive Drawer trên thiết bị di động.
- **Vietnamese Criteria & Real-time Search:** Tự động chuẩn hóa tiêu chí sang tiếng Việt chính thức theo quy chế mới (Kỳ 2026-1+). Cho phép tìm kiếm sự kiện theo tên hoạt động, địa điểm lẫn tên tiêu chí ĐRL (VD: hiến máu, thể thao, NCKH...).
- **Missing Criteria Filter (Lọc bù điểm thiếu):** Tự động phát hiện các tiêu chí đang có 0 điểm và gắn nhãn `🎯 Bù điểm thiếu` cho các sự kiện phù hợp, kèm bộ lọc 1-click.
- **Smart SQLite Caching:** Lưu trữ và tái sử dụng bộ nhớ đệm thông minh với TTL (Time-To-Live) tự động để giảm tải scraping và tối ưu tốc độ phản hồi.
- **Auto-sync & Participation:** Đăng ký sự kiện trực tiếp và tự động làm mới bảng điểm rèn luyện tức thì.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite
- **Backend:** Python (FastAPI), SQLite3 (WAL mode), Pydantic v2, HTTPX
- **Automation Tools:** Playwright (token capture utility)

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Backend Setup (Python)

Navigate to the `backend` directory, set up your virtual environment, and install dependencies:

```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

Set up your `.env` file from the provided example:
```bash
cp .env.example .env
```
Fill in your student credentials or CTSV tokens (or run `python scripts/get_credentials.py`).

Initialize database tables (optional, runs automatically on startup):
```bash
python app/db/init_db.py
```

Start the FastAPI backend:
```bash
python main.py
# Or with uvicorn directly:
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
API runs on `http://127.0.0.1:8000`. Interactive docs are available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`. The Vite proxy will route `/api/*` directly to `http://127.0.0.1:8000`.

---

## 📂 Architecture Overview

```text
backend/
├── app/
│   ├── main.py                  # FastAPI entrypoint, CORS, lifespan
│   ├── core/                    # App settings & 2026-1 criteria constants
│   ├── api/                     # Dependency injection & API v1 routers
│   ├── schemas/                 # Pydantic request/response validation
│   ├── services/                # Business logic (cache TTL, missing criteria, scoring)
│   ├── clients/                 # Async CTSV portal HTTP client
│   └── db/                      # SQLite thread-safe session & repositories
├── scripts/                     # Standalone tools (get_credentials, etc.)
└── data/                        # SQLite databases & criteria schemas (gitignored)
frontend/
├── src/
│   ├── components/
│   │   ├── Activity/            # ActivityCard, ActivityModal
│   │   ├── ActivityList.tsx     # Filterable activities grid & criteria search
│   │   ├── DrlDashboardView.tsx # 5-second visualization & criteria tree
│   │   └── Sidebar.tsx          # Responsive navigation sidebar
│   ├── helpers/                 # Date, criteria mapping & scoring calculators
│   └── types/                   # TypeScript interfaces
```

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
