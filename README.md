# Tigersoft Installation Reference Portal

Next.js 16 + Supabase portal สำหรับคลังเคส เอกสาร การจัดการผู้ใช้ การแจ้งเตือน และ first-party analytics

## Setup

1. คัดลอก `.env.example` เป็น `.env.local` และกรอกค่าจริง ห้ามนำ `SUPABASE_SERVICE_ROLE_KEY` หรือ `ANALYTICS_HASH_SECRET` ไปใช้ใน Client Component
2. เชื่อม Supabase CLI แล้วใช้ `npx supabase db push` เพื่อรัน migrations ใน `supabase/migrations`
3. ตั้ง Supabase Auth Site URL เป็นค่าเดียวกับ `SITE_URL` และเพิ่ม Redirect URL `${SITE_URL}/auth/callback`
4. รัน `npm run dev`

ระบบอีเมลเริ่มต้นของ Supabase เหมาะกับการทดสอบหรือปริมาณต่ำ หากใช้งาน production ให้ตั้ง Corporate SMTP ใน Supabase Dashboard โดย flow ของแอปไม่ต้องเปลี่ยน

## Commands

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

## Security and privacy

- หน้าเนื้อหาเป็น public; Favorites, Recent, Notifications และ Admin ต้อง Login
- Admin/Tech มีสิทธิ์หลังบ้านเท่ากัน และ service-role ถูกเรียกจาก server เท่านั้น
- Analytics ใช้ HttpOnly visitor/session cookies ไม่เก็บ IP, fingerprint หรือ raw user-agent
- Raw analytics เก็บ 90 วัน และ cron rollup ทำงานตามวันเวลา `Asia/Bangkok`
- KPI ใหม่เริ่มนับเมื่อ deploy migration; `case_studies.view_count` ยังเป็น legacy-compatible counter
