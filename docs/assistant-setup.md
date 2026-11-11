# ผู้ช่วย AI นายช่าง — V1

V1 ใช้ Gemini Developer API แบบ Public text-only เท่านั้น ไม่มี OpenAI dependency/ค่าใช้จ่าย และไม่ส่ง sales_notes, tech_notes, รูปหน้างาน หรือ Lead contact ให้โมเดล Provider interface อยู่ใน `src/lib/assistant/provider.ts`; เพิ่ม Adapter ที่ทดสอบแล้วก่อนเพิ่มตัวเลือกใน schema/Admin ไม่มี auto-switch provider

## ตั้งค่าครั้งเดียว

1. Apply `supabase/migrations/20261109181812_assistant_public.sql` ไป project เดียวกับแอป (ห้าม reset ฐานข้อมูลจริง)
2. ตั้ง Environment Variables ใน Vercel และ `.env.local`: `GEMINI_API_KEY`, `GEMINI_FREE_TIER_CONFIRMED=true` หลังตรวจ Free Tier ของ project ใน AI Studio, `ASSISTANT_COOKIE_SECRET` สุ่มอย่างน้อย 32 ตัว (หากไม่ตั้งใช้ ANALYTICS_HASH_SECRET เดิมโดยแยก HMAC namespace), `CRON_SECRET` สุ่ม, และ Supabase service role ที่มีอยู่
3. สร้าง Cloudflare Turnstile widget สำหรับ domain ของแอป ตั้ง `NEXT_PUBLIC_TURNSTILE_SITE_KEY` และ `TURNSTILE_SECRET_KEY` ถ้ายังไม่ตั้ง ระบบจะจำกัด AI หลัง threshold และยังค้นข้อมูลธรรมดาได้
4. ที่ `/admin/assistant` เลือก Gemini รุ่นที่บัญชีแสดงว่าใช้ Free Tier ได้ ทดสอบด้วย FAQ จำลอง บันทึก Draft และ Publish เปิด Widget/Public
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
- Maintenance hourly ลบ Public 7 วัน /Staff 30 วัน, closed Lead/Feedback 90 วัน และเคลียร์ stale pending หลัง 2 นาที ถ้าใช้ Vercel plan ที่ไม่รองรับ hourly cron ให้ใช้ scheduler เรียก endpoint พร้อม Bearer CRON_SECRET
- Avatar bucket private อ่านผ่าน route ที่ตรวจชื่อไฟล์ ไม่เปิดเขียนไฟล์จาก client
- คำตอบใหม่สตรีมผ่าน SSE; duplicate ที่ตอบเสร็จแล้วคืน JSON และโหลดประวัติกลับได้ retrieval ไม่ใช่ semantic search; การตรวจ PII/คำขอเสี่ยงเป็น baseline ไม่รับประกันตรวจพบทุกแบบ จึงต้องแสดง notice และจำกัดฐานข้อมูล Public

## Acceptance

ทดสอบ FAQ ภาษาไทย/English, เคส published เท่านั้น, FAQ ของ draft ไม่ปรากฏ, documents เปิดผ่าน route เดิม; anonymous คนอื่นอ่าน conversation ไม่ได้; quota/CAPTCHA fallback; duplicate message ID; provider timeout; Admin vs Tech publish; Lead consent/notification; cron deletion; Mobile/focus/Escape/reduced-motion

Live Gemini check ต้องใช้ key ของ project Free Tier จริง ห้ามใส่คีย์ในแชทหรือ commit ค่า secret
