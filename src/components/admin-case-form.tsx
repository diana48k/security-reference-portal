import Link from 'next/link'

import { SubmitButton } from '@/src/components/submit-button'
import {
  createCaseStudyAction,
  updateCaseStudyAction,
} from '@/src/lib/actions/cases'
import type {
  AdminCaseDetail,
  CaseFormOption,
} from '@/src/lib/queries/admin-cases'

type AdminCaseFormProps = {
  mode: 'create' | 'edit'
  caseStudy?: AdminCaseDetail
  categories: CaseFormOption[]
  siteTypes: CaseFormOption[]
  doorTypes: CaseFormOption[]
  systemTypes: CaseFormOption[]
}

function dateValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : ''
}

function numberValue(value: number | null | undefined) {
  return value ?? ''
}

export function AdminCaseForm({
  mode,
  caseStudy,
  categories,
  siteTypes,
  doorTypes,
  systemTypes,
}: AdminCaseFormProps) {
  const action =
    mode === 'edit' ? updateCaseStudyAction : createCaseStudyAction

  return (
    <form action={action} className="space-y-6">
      {caseStudy ? <input type="hidden" name="id" value={caseStudy.id} /> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">ข้อมูลเคส</h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <InputField
            label="ชื่อเคส"
            name="title"
            placeholder="Factory access control installation"
            defaultValue={caseStudy?.title}
            required
          />

          <InputField
            label="ชื่อ URL (Slug)"
            name="slug"
            placeholder="factory-access-control-glass-door"
            helper="เว้นว่างได้ ระบบจะสร้างจากชื่อเคสให้อัตโนมัติ"
            defaultValue={caseStudy?.slug}
          />

          <InputField
            label="คำอธิบายสั้น"
            name="subtitle"
            placeholder="สรุปสั้นสำหรับการ์ดและหน้ารายละเอียด"
            defaultValue={caseStudy?.subtitle}
          />

          <InputField
            label="ลูกค้า / โครงการ"
            name="customer_name"
            placeholder="Example Customer A"
            defaultValue={caseStudy?.customer_name}
          />

          <InputField
            label="สถานที่"
            name="location"
            placeholder="Factory, office, carpark, warehouse"
            defaultValue={caseStudy?.location}
          />

          <InputField
            label="วันที่ติดตั้ง"
            name="installed_at"
            type="date"
            defaultValue={dateValue(caseStudy?.installed_at)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">หมวดหมู่และตัวกรอง</h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <SelectField
            label="หมวดระบบ"
            name="category_id"
            options={categories}
            defaultValue={caseStudy?.category_id}
          />
          <SelectField
            label="ประเภทสถานที่"
            name="site_type_id"
            options={siteTypes}
            defaultValue={caseStudy?.site_type_id}
          />
          <SelectField
            label="ประเภทประตู"
            name="door_type_id"
            options={doorTypes}
            defaultValue={caseStudy?.door_type_id}
          />
          <SelectField
            label="ระบบหลัก"
            name="primary_system_type_id"
            options={systemTypes}
            defaultValue={caseStudy?.primary_system_type_id}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">ข้อมูลงานขาย</h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <InputField
            label="งบประมาณขั้นต่ำ"
            name="budget_min"
            type="number"
            placeholder="35000"
            defaultValue={numberValue(caseStudy?.budget_min)}
          />

          <InputField
            label="งบประมาณสูงสุด"
            name="budget_max"
            type="number"
            placeholder="65000"
            defaultValue={numberValue(caseStudy?.budget_max)}
          />

          <InputField
            label="จำนวนผู้ใช้งาน"
            name="user_count"
            type="number"
            placeholder="300"
            defaultValue={numberValue(caseStudy?.user_count)}
          />

          <InputField
            label="จำนวนวันติดตั้ง"
            name="installation_days"
            type="number"
            placeholder="2"
            defaultValue={numberValue(caseStudy?.installation_days)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">บันทึกโครงการ</h2>

        <div className="mt-6 space-y-5">
          <TextareaField
            label="โจทย์ / ปัญหาของลูกค้า"
            name="problem_statement"
            placeholder="ลูกค้าต้องการแก้ปัญหาอะไร"
            defaultValue={caseStudy?.problem_statement}
          />

          <TextareaField
            label="สรุปความต้องการ"
            name="requirement_summary"
            placeholder="ความต้องการหลักและข้อจำกัดของหน้างาน"
            defaultValue={caseStudy?.requirement_summary}
          />

          <TextareaField
            label="แนวทางแก้ไข"
            name="solution_statement"
            placeholder="แนวทางติดตั้งและอุปกรณ์ที่ใช้"
            defaultValue={caseStudy?.solution_statement}
          />

          <TextareaField
            label="หมายเหตุการติดตั้ง"
            name="installation_notes"
            placeholder="หมายเหตุหน้างาน การเดินสาย จุดติดตั้ง หรือจุดสำรวจ"
            defaultValue={caseStudy?.installation_notes}
          />

          <TextareaField
            label="บันทึกสำหรับทีมขาย"
            name="sales_notes"
            placeholder="จุดขายหรือข้อควรพูดกับลูกค้า"
            defaultValue={caseStudy?.sales_notes}
          />

          <TextareaField
            label="บันทึกสำหรับทีมเทคนิค"
            name="tech_notes"
            placeholder="หมายเหตุภายในสำหรับทีมเทคนิค"
            defaultValue={caseStudy?.tech_notes}
          />

          <TextareaField
            label="ข้อความที่แสดงให้ลูกค้าเห็น"
            name="customer_visible_notes"
            placeholder="ข้อความสำหรับหน้าเคสหรือใช้พรีเซนต์ลูกค้า"
            defaultValue={caseStudy?.customer_visible_notes}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">การเผยแพร่</h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              สถานะ
            </label>

            <select
              name="status"
              defaultValue={caseStudy?.status ?? 'draft'}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none"
            >
              <option value="draft">ฉบับร่าง - ซ่อนจากหน้าทีมขาย</option>
              <option value="published">เผยแพร่แล้ว - แสดงในหน้าทีมขาย</option>
              <option value="archived">เก็บถาวร - ซ่อนจากหน้าทีมขาย</option>
            </select>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={caseStudy?.is_featured ?? false}
              className="h-5 w-5 rounded border-slate-300"
            />
            <span className="text-sm font-semibold text-slate-700">
              แสดงเป็นเคสแนะนำในหน้าหลัก
            </span>
          </label>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <SubmitButton
          pendingText={mode === 'edit' ? 'กำลังบันทึก...' : 'กำลังสร้าง...'}
          className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {mode === 'edit' ? 'บันทึกการแก้ไข' : 'สร้างเคส'}
        </SubmitButton>

        <Link
          href="/admin/cases"
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
        >
          ยกเลิก
        </Link>
      </div>
    </form>
  )
}

function InputField({
  label,
  name,
  type = 'text',
  placeholder,
  helper,
  required,
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  helper?: string
  required?: boolean
  defaultValue?: string | number | null
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue ?? ''}
        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none transition focus:border-slate-400"
      />

      {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
    </div>
  )
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string
  name: string
  options: CaseFormOption[]
  defaultValue?: string | null
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        name={name}
        defaultValue={defaultValue ?? ''}
        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none"
      >
        <option value="">ไม่ระบุ</option>

        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name_th}
          </option>
        ))}
      </select>
    </div>
  )
}

function TextareaField({
  label,
  name,
  placeholder,
  defaultValue,
}: {
  label: string
  name: string
  placeholder?: string
  defaultValue?: string | null
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <textarea
        name={name}
        rows={5}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ''}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-400"
      />
    </div>
  )
}
