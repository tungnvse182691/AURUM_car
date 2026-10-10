# AURUM — *Driven by Gold.*

Website showroom ô tô hạng sang — dark luxury, cinematic, hiệu ứng độc lạ.

## Tech stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (design tokens custom)
- **Framer Motion** (animation), **Zustand** (state), **React Router**
- **MSW** (mock API — demo, chưa cần backend)

## Chạy local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build production
```

## Tính năng (Phase 1–3)

- Preloader cinematic, hero parallax "Đêm ra mắt", custom cursor, magnetic buttons, marquee, card 3D tilt
- **Bộ sưu tập** (`/cars`): lọc hãng / giá / nhiên liệu / hộp số / xe mới, sort, tìm kiếm realtime
- **Chi tiết xe** (`/cars/:slug`): gallery, bảng thông số, mô tả, trang bị, xe liên quan, **tính trả góp realtime**
- **So sánh** (`/compare`): tối đa 3 xe, highlight thông số tốt nhất từng hàng
- **Tính trả góp** (`/loan-calculator`): kéo thả là thấy số tiền/tháng
- **Yêu thích** (`/favorites`): lưu xe vào bộ sưu tập cá nhân (localStorage)
- Xưởng sơn AURUM: configurator đổi màu sơn realtime

## Demo accounts (Phase 4 — auth)

| Role  | Email            | Mật khẩu |
| ----- | ---------------- | -------- |
| Admin | admin@aurum.vn   | aurum123 |
| Staff | staff@aurum.vn   | aurum123 |
| User  | user@aurum.vn    | aurum123 |

## Kế hoạch

Xem `KE-HOACH-WEB-BAN-OTO.md` trong `~/workspace/user/files/` — 8 phases từ scaffold đến admin/staff dashboard.
