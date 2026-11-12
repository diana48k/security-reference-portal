# ผู้ช่วย AI นายช่าง — V1

V1 ใช้ Gemini Developer API แบบ Public text-only เท่านั้น ไม่มี OpenAI dependency/ค่าใช้จ่าย และไม่ส่ง sales_notes, tech_notes, รูปหน้างาน หรือ Lead contact ให้โมเดล Provider interface อยู่ใน `src/lib/assistant/provider.ts`; เพิ่ม Adapter ที่ทดสอบแล้วก่อนเพิ่มตัวเลือกใน schema/Admin ไม่มี auto-switch provider

## ตั้งค่าบน Vercel

`.env.local` ใช้เฉพาะเครื่องของคุณและไม่ถูกส่งไปกับ GitHub ให้เพิ่มค่าที่ **Vercel → Project → Settings → Environment Variables** แล้วเลือก **Production** สำหรับโดเมนจริง หรือ **Preview** สำหรับ branch ทดสอบ ควรแยก secret ของ Production ออกจาก Preview หากเป็นคนละสภาพแวดล้อม หลังแก้ค่าให้ Deploy ใหม่ เพราะ deployment เก่าจะไม่ได้รับค่าใหม่

| ตัวแปร | เอาค่าจากที่ไหน / ใช้ทำอะไร |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | [Supabase Dashboard](https://supabase.com/dashboard) → โปรเจกต์เดียวกับ Portal → **Connect** หรือ **Settings → API Keys** ใช้ Project URL และ Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase โปรเจกต์เดียวกัน → **Settings → API Keys** → server-side secret key หรือ legacy `service_role` ห้ามใช้ Publishable key แทน และห้ามใส่ `NEXT_PUBLIC_` |
| `SITE_URL` | URL จริงของเว็บไซต์ เช่น `https://your-project.vercel.app` สำหรับ Production ใช้โดเมนหลักเดียวกับ **Supabase → Authentication → URL Configuration → Site URL** และเพิ่ม `https://your-project.vercel.app/auth/callback` ใน Redirect URLs |
| `ANALYTICS_HASH_SECRET` | ค่าสุ่มที่ใช้กับ Analytics และเป็นค่า fallback สำหรับลงลายเซ็น cookie ของ Assistant ใช้ค่าที่ตั้งบนเว็บเดิมต่อถ้ามี |
| `ASSISTANT_COOKIE_SECRET` | ไม่บังคับถ้า `ANALYTICS_HASH_SECRET` ยาวอย่างน้อย 32 ตัวอักษร ถ้าต้องการแยกค่า ให้สุ่มใหม่และตั้งครั้งเดียว การเปลี่ยนค่าจะทำให้ cookie ประวัติผู้ชมเดิมใช้ไม่ได้ |
| `GEMINI_API_KEY`, `GEMINI_FREE_TIER_CONFIRMED` | [Google AI Studio → API Keys](https://aistudio.google.com/apikey) → **Create API key** เลือกโปรเจกต์ที่แสดง **Free Tier** แล้วตั้งตัวแปรยืนยันเป็น `true` หลังตรวจ Billing เท่านั้น ไม่ต้องใช้ OpenAI key |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | [Cloudflare → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) → **Add widget** → Managed → เพิ่ม hostname ของเว็บโดยไม่ใส่ `https://` คัดลอก Site Key และ Secret Key ให้ตรงชื่อตัวแปร |
| `CRON_SECRET` | ค่าสุ่มสำหรับ Vercel เรียก maintenance อัตโนมัติ สร้างเองแล้วตั้งใน **Production** ไม่ต้องขอ key จากเว็บอื่น |

สำหรับค่าที่ต้องสุ่ม ให้รันคำสั่งนี้ในเครื่องหนึ่งครั้งต่อ secret แล้วนำผลไปใส่ใน Vercel โดยตรง:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

อย่าใส่ค่าคีย์ในแชท, README หรือ GitHub ใช้ [Vercel Secrets](https://vercel.com/docs/environment-variables) สำหรับค่าที่ไม่มี `NEXT_PUBLIC_` และเป็นความลับ

## ตรวจและเปิดใช้งาน

1. Apply `supabase/migrations/20261109181812_assistant_public.sql` ไป project เดียวกับแอป (ห้าม reset ฐานข้อมูลจริง)
2. ตรวจว่า Deployment เป็น **Ready** และหน้าเว็บกับ `/api/assistant/config` เปิดได้ การ build ผ่านอย่างเดียวไม่ได้ยืนยันว่าใส่ Gemini key หรือเปิด Widget แล้ว
3. ตั้ง Turnstile ให้ครบก่อนเปิด Public เพื่อให้ผู้ชมที่ถูกขอยืนยันผ่านได้ หากยังไม่มีคีย์ ผู้ชมที่ถึงเกณฑ์ยังค้นข้อมูลธรรมดาได้
4. ที่ `/admin/assistant` เลือก Gemini รุ่นที่บัญชีแสดงว่าใช้ Free Tier ได้ กด **ทดสอบการเชื่อมต่อด้วย FAQ จำลอง** ให้ผ่าน จากนั้นติ๊ก **เปิด Widget** (สำหรับทดสอบหลังล็อกอิน) แล้ว **บันทึกและ Publish** เมื่อพร้อมให้ผู้ชมใช้งานจึงติ๊ก **เปิด Public** และ Publish อีกครั้ง ทดสอบในหน้าต่างไม่ระบุตัวตนด้วยคำถามที่มี FAQ/เคสจริง และตรวจว่าได้คำตอบพร้อมแหล่งอ้างอิงโดยไม่ขึ้นป้าย fallback
5. อัปโหลด Original Tigersoft Avatar 5 สถานะ PNG/WebP: Welcome ≤250 KB สถานะอื่น ≤800 KB; ใช้โลโก้เดิมเมื่อยังไม่มีภาพ รองรับ reduced motion โดยแสดงโลโก้นิ่ง
6. ใช้ **จัดกรอบ Avatar** เพื่อซูม 100–160% และเลื่อนตำแหน่งแนวนอน/แนวตั้ง ดูแต่ละสถานะใน Preview ก่อนบันทึก ขนาดกรอบ Desktop ประมาณ 420 × 240 px และย่อบนมือถือ ควรใช้ภาพครึ่งตัวที่ตัดขอบโปร่งใสส่วนเกินออกและมีตำแหน่งใบหน้าตรงกันทุกสถานะ ค่าจัดกรอบไม่เปลี่ยนไฟล์ต้นฉบับหรือเพดานอัปโหลด
7. ก่อนเปิด Lead กรอกช่องทางติดต่อบริษัท Privacy URL และ consent text ใน Admin

ไม่มี paid provider เปิดใน V1; การยืนยัน Free Tier เป็นการยืนยันของผู้ดูแล แอปตรวจ billing tier จาก API key ไม่ได้ หากเปิด Billing ที่ Google ภายหลังต้องปิด AI/ปรับการเชื่อมต่อก่อน ไม่สามารถรับรองค่า $0 จากชื่อโมเดลเพียงอย่างเดียว

## ขอบเขตและการดูแล

- เปิด Widget ใน PortalShell ทั้ง Public/Staff; ไม่แสดงหน้า login/password/presentation
- ทุกบทสนทนาเป็น Public knowledge ใน V1 แม้ล็อกอิน ข้อมูล Lead ส่ง Supabase เท่านั้น
- ค่า model/config แก้และ Publish ได้เฉพาะ Admin; Tech ทดสอบและจัดการ Inbox ได้ ประวัติเวอร์ชันบันทึก actor/time ย้อน Publish ได้
- Anonymous cookie ลงลายเซ็น HttpOnly; ownership ตรวจที่ endpoint ไม่เปิดตาราง chat ให้ anon/authenticated ผ่าน Data API
- วันโควตาใช้ UTC; จำกัด 15 Public /100 Staff ต่อวัน และ network burst 60/10 นาที โควตาอาจถูกนับแม้ provider ล้มเหลวเพื่อป้องกัน retry abuse
- Assistant ไม่ส่ง transcript เก่าให้ Gemini; คำถามแต่ละครั้งต้องมีบริบทพอในข้อความเดียว ประวัติอ่านกลับจาก Supabase
- UI แสดงข้อความแบบ plain text ไม่ render HTML/Markdown จากโมเดล ลิงก์ใช้ source card ที่ server สร้างเท่านั้น
- [Vercel Cron](https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing) เรียก maintenance วันละครั้งใน Production ช่วง 03:00–03:59 น. เวลาไทย (`0 20 * * *` UTC) เพื่อรองรับ Hobby โดยไม่ต้องอัปเกรด ข้อมูลบทสนทนาที่หมดอายุเปิดอ่านหรือใช้งานต่อไม่ได้ทันที ส่วนการลบจริงและการลบ Lead/Feedback ที่ปิดครบ 90 วันจะเกิดรอบถัดไป ข้อความที่ค้างถูกเคลียร์เมื่อส่งข้อความใหม่ในบทสนทนาเดิมหลังครบ 2 นาที หรือโดยรอบ maintenance
- Avatar bucket private อ่านผ่าน route ที่ตรวจชื่อไฟล์ ไม่เปิดเขียนไฟล์จาก client
- คำตอบใหม่สตรีมผ่าน SSE; duplicate ที่ตอบเสร็จแล้วคืน JSON และโหลดประวัติกลับได้ retrieval ไม่ใช่ semantic search; การตรวจ PII/คำขอเสี่ยงเป็น baseline ไม่รับประกันตรวจพบทุกแบบ จึงต้องแสดง notice และจำกัดฐานข้อมูล Public

## Acceptance

ทดสอบ FAQ ภาษาไทย/English, เคส published เท่านั้น, FAQ ของ draft ไม่ปรากฏ, documents เปิดผ่าน route เดิม; anonymous คนอื่นอ่าน conversation ไม่ได้; quota/CAPTCHA fallback; duplicate message ID; provider timeout; Admin vs Tech publish; Lead consent/notification; cron deletion; Mobile/focus/Escape/reduced-motion

Live Gemini check ต้องใช้ key ของ project Free Tier จริง ห้ามใส่คีย์ในแชทหรือ commit ค่า secret
