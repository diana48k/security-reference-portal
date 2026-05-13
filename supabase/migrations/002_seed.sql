-- =========================================================
-- Seed lookup data
-- =========================================================

insert into public.categories (slug, name_th, name_en, description, icon, sort_order)
values
  ('access-control', 'Access Control', 'Access Control', 'ระบบควบคุมการเข้าออกประตู อาคาร และพื้นที่สำคัญ', 'shield-check', 1),
  ('time-attendance', 'Time Attendance', 'Time Attendance', 'ระบบบันทึกเวลาเข้าออกงานของพนักงาน', 'clock', 2),
  ('carpark', 'Carpark', 'Carpark System', 'ระบบจัดการทางเข้าออกลานจอดรถ', 'car', 3),
  ('flap-barrier', 'Flap Barrier', 'Flap Barrier', 'ระบบประตูกั้นทางเดินสำหรับอาคารและสำนักงาน', 'columns', 4),
  ('swing-gate', 'Swing Gate', 'Swing Gate', 'ระบบประตู swing gate สำหรับทางเข้าออกบุคคล', 'door-open', 5)
on conflict (slug) do nothing;

insert into public.site_types (slug, name_th, name_en, sort_order)
values
  ('office', 'ออฟฟิศ', 'Office', 1),
  ('factory', 'โรงงาน', 'Factory', 2),
  ('condo', 'คอนโด', 'Condominium', 3),
  ('warehouse', 'คลังสินค้า', 'Warehouse', 4),
  ('school', 'โรงเรียน/สถานศึกษา', 'School', 5),
  ('hospital', 'โรงพยาบาล/คลินิก', 'Hospital/Clinic', 6),
  ('parking-area', 'ลานจอดรถ', 'Parking Area', 7)
on conflict (slug) do nothing;

insert into public.door_types (slug, name_th, name_en, sort_order)
values
  ('glass-door', 'ประตูกระจก', 'Glass Door', 1),
  ('wooden-door', 'ประตูไม้', 'Wooden Door', 2),
  ('steel-door', 'ประตูเหล็ก', 'Steel Door', 3),
  ('sliding-door', 'ประตูบานเลื่อน', 'Sliding Door', 4),
  ('rolling-shutter', 'ประตูม้วน', 'Rolling Shutter', 5),
  ('flap-barrier', 'Flap Barrier', 'Flap Barrier', 6),
  ('swing-gate', 'Swing Gate', 'Swing Gate', 7),
  ('carpark-gate', 'ไม้กั้นรถยนต์', 'Carpark Barrier Gate', 8)
on conflict (slug) do nothing;

insert into public.system_types (slug, name_th, name_en, sort_order)
values
  ('access-control', 'Access Control', 'Access Control', 1),
  ('time-attendance', 'Time Attendance', 'Time Attendance', 2),
  ('face-scan', 'เครื่องสแกนใบหน้า', 'Face Recognition', 3),
  ('fingerprint', 'เครื่องสแกนนิ้ว', 'Fingerprint', 4),
  ('rfid-card', 'บัตร RFID', 'RFID Card', 5),
  ('carpark-lpr', 'Carpark / LPR', 'Carpark / LPR', 6),
  ('flap-barrier', 'Flap Barrier', 'Flap Barrier', 7),
  ('swing-gate', 'Swing Gate', 'Swing Gate', 8)
on conflict (slug) do nothing;

insert into public.tags (slug, name_th, name_en)
values
  ('before-after', 'มีรูป Before/After', 'Before/After'),
  ('outdoor', 'ติดตั้งภายนอกอาคาร', 'Outdoor'),
  ('indoor', 'ติดตั้งภายในอาคาร', 'Indoor'),
  ('lan', 'ใช้ LAN', 'LAN'),
  ('wifi', 'ใช้ Wi-Fi', 'Wi-Fi'),
  ('factory-case', 'เคสโรงงาน', 'Factory Case'),
  ('office-case', 'เคสออฟฟิศ', 'Office Case'),
  ('high-traffic', 'คนเข้าออกจำนวนมาก', 'High Traffic'),
  ('need-site-survey', 'ควรสำรวจหน้างานก่อน', 'Need Site Survey')
on conflict (slug) do nothing;

-- =========================================================
-- Seed sample case studies
-- =========================================================

with refs as (
  select
    (select id from public.categories where slug = 'access-control') as cat_access,
    (select id from public.categories where slug = 'carpark') as cat_carpark,
    (select id from public.categories where slug = 'flap-barrier') as cat_flap,
    (select id from public.site_types where slug = 'factory') as site_factory,
    (select id from public.site_types where slug = 'office') as site_office,
    (select id from public.site_types where slug = 'parking-area') as site_parking,
    (select id from public.door_types where slug = 'glass-door') as door_glass,
    (select id from public.door_types where slug = 'carpark-gate') as door_carpark,
    (select id from public.door_types where slug = 'flap-barrier') as door_flap,
    (select id from public.system_types where slug = 'access-control') as sys_access,
    (select id from public.system_types where slug = 'carpark-lpr') as sys_carpark,
    (select id from public.system_types where slug = 'flap-barrier') as sys_flap
)
insert into public.case_studies (
  slug,
  title,
  subtitle,
  category_id,
  site_type_id,
  door_type_id,
  primary_system_type_id,
  location,
  customer_name,
  budget_min,
  budget_max,
  user_count,
  installation_days,
  installed_at,
  problem_statement,
  requirement_summary,
  solution_statement,
  installation_notes,
  sales_notes,
  tech_notes,
  customer_visible_notes,
  status,
  is_featured,
  published_at
)
select
  'factory-access-control-glass-door',
  'ติดตั้ง Access Control ประตูกระจกโรงงาน',
  'ควบคุมการเข้าออกประตูสำนักงานภายในโรงงาน',
  cat_access,
  site_factory,
  door_glass,
  sys_access,
  'นิคมอุตสาหกรรม',
  'ตัวอย่างลูกค้าโรงงาน A',
  35000,
  65000,
  300,
  2,
  current_date - interval '30 days',
  'ลูกค้าต้องการควบคุมการเข้าออกสำนักงานภายในโรงงาน และต้องการดูประวัติการเข้าออกของพนักงาน',
  'ต้องการระบบที่ใช้งานง่าย รองรับพนักงานจำนวนมาก และมีรูปแบบติดตั้งที่เรียบร้อย',
  'ติดตั้งเครื่องสแกนใบหน้า พร้อมชุดกลอนไฟฟ้าและอุปกรณ์ควบคุมประตู',
  'ตรวจสอบไฟเลี้ยง จุดเดินสาย และตำแหน่งติดตั้งเครื่องก่อนเริ่มงาน',
  'เหมาะสำหรับนำเสนอให้ลูกค้าโรงงานที่ต้องการควบคุมประตูสำนักงานหรือพื้นที่เฉพาะ',
  'ควรตรวจสอบชนิดประตูและตำแหน่งเดินสายก่อนเสนอราคา',
  'ระบบนี้ช่วยให้ลูกค้าควบคุมการเข้าออกได้ชัดเจนและตรวจสอบย้อนหลังได้',
  'published',
  true,
  now()
from refs
on conflict (slug) do nothing;

with refs as (
  select
    (select id from public.categories where slug = 'carpark') as cat_carpark,
    (select id from public.site_types where slug = 'parking-area') as site_parking,
    (select id from public.door_types where slug = 'carpark-gate') as door_carpark,
    (select id from public.system_types where slug = 'carpark-lpr') as sys_carpark
)
insert into public.case_studies (
  slug,
  title,
  subtitle,
  category_id,
  site_type_id,
  door_type_id,
  primary_system_type_id,
  location,
  customer_name,
  budget_min,
  budget_max,
  user_count,
  installation_days,
  installed_at,
  problem_statement,
  requirement_summary,
  solution_statement,
  installation_notes,
  sales_notes,
  tech_notes,
  customer_visible_notes,
  status,
  is_featured,
  published_at
)
select
  'carpark-lpr-factory-gate',
  'ติดตั้งระบบ Carpark / LPR ทางเข้าโรงงาน',
  'ควบคุมรถเข้าออกด้วยไม้กั้นและระบบอ่านป้ายทะเบียน',
  cat_carpark,
  site_parking,
  door_carpark,
  sys_carpark,
  'ลานจอดรถโรงงาน',
  'ตัวอย่างลูกค้าโรงงาน B',
  120000,
  250000,
  null,
  3,
  current_date - interval '20 days',
  'ลูกค้าต้องการลดการจดทะเบียนรถด้วยมือ และควบคุมรถเข้าออกให้เป็นระบบ',
  'ต้องการระบบไม้กั้นพร้อมบันทึกข้อมูลรถเข้าออก',
  'ติดตั้งไม้กั้นรถยนต์ กล้องอ่านป้ายทะเบียน และระบบจัดเก็บข้อมูล',
  'ควรสำรวจความกว้างทางเข้าออก จุดวางตู้ควบคุม และไฟเลี้ยง',
  'เหมาะสำหรับลูกค้าที่มีรถเข้าออกจำนวนมาก เช่น โรงงาน อาคารสำนักงาน และลานจอดรถ',
  'ต้องตรวจสอบมุมกล้อง แสง และตำแหน่งป้ายทะเบียนจริงหน้างาน',
  'ระบบช่วยให้การเข้าออกลานจอดเป็นระเบียบ ตรวจสอบย้อนหลังได้ง่าย',
  'published',
  true,
  now()
from refs
on conflict (slug) do nothing;

with refs as (
  select
    (select id from public.categories where slug = 'flap-barrier') as cat_flap,
    (select id from public.site_types where slug = 'office') as site_office,
    (select id from public.door_types where slug = 'flap-barrier') as door_flap,
    (select id from public.system_types where slug = 'flap-barrier') as sys_flap
)
insert into public.case_studies (
  slug,
  title,
  subtitle,
  category_id,
  site_type_id,
  door_type_id,
  primary_system_type_id,
  location,
  customer_name,
  budget_min,
  budget_max,
  user_count,
  installation_days,
  installed_at,
  problem_statement,
  requirement_summary,
  solution_statement,
  installation_notes,
  sales_notes,
  tech_notes,
  customer_visible_notes,
  status,
  is_featured,
  published_at
)
select
  'office-flap-barrier-entrance',
  'ติดตั้ง Flap Barrier ทางเข้าอาคารสำนักงาน',
  'ควบคุมทางเข้าออกพนักงานและผู้มาติดต่อ',
  cat_flap,
  site_office,
  door_flap,
  sys_flap,
  'อาคารสำนักงาน',
  'ตัวอย่างลูกค้าออฟฟิศ C',
  180000,
  320000,
  500,
  4,
  current_date - interval '10 days',
  'ลูกค้าต้องการควบคุมผู้เข้าออกบริเวณ lobby และลดการเข้าออกโดยไม่ได้รับอนุญาต',
  'ต้องการระบบที่ดูเรียบร้อย เข้ากับอาคารสำนักงาน และรองรับปริมาณคนจำนวนมาก',
  'ติดตั้ง Flap Barrier พร้อมเครื่องอ่านบัตร/ใบหน้า และเชื่อมต่อระบบควบคุมสิทธิ์',
  'ต้องตรวจสอบพื้นที่ติดตั้ง ระยะทางเดิน ไฟเลี้ยง และแนวเดินสายใต้พื้น',
  'เหมาะสำหรับนำเสนออาคารสำนักงาน คอนโด โรงเรียน หรือพื้นที่ที่ต้องการควบคุมคนจำนวนมาก',
  'ควรมีแบบพื้นที่หรือสำรวจหน้างานก่อนสรุปจำนวน lane',
  'ระบบช่วยเพิ่มความปลอดภัยและสร้างภาพลักษณ์ที่เป็นมืออาชีพให้กับอาคาร',
  'published',
  true,
  now()
from refs
on conflict (slug) do nothing;