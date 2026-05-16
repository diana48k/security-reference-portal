import { createCaseStudyAction } from '@/src/lib/actions/cases'
import type { CaseFormOption } from '@/src/lib/queries/admin-cases'

type AdminCaseFormProps = {
    categories: CaseFormOption[]
    siteTypes: CaseFormOption[]
    doorTypes: CaseFormOption[]
    systemTypes: CaseFormOption[]
}

export function AdminCaseForm({
    categories,
    siteTypes,
    doorTypes,
    systemTypes,
}: AdminCaseFormProps) {
    return (
        <form action={createCaseStudyAction} className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-950">ข้อมูลหลักของเคส</h2>

                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    <InputField
                        label="ชื่อเคส"
                        name="title"
                        placeholder="เช่น ติดตั้ง Access Control ประตูกระจกโรงงาน"
                        required
                    />

                    <InputField
                        label="Slug URL"
                        name="slug"
                        placeholder="เช่น factory-access-control-glass-door"
                        helper="ไม่กรอกก็ได้ ระบบจะสร้างจากชื่อเคสให้อัตโนมัติ"
                    />

                    <InputField
                        label="คำอธิบายสั้น"
                        name="subtitle"
                        placeholder="เช่น ควบคุมประตูสำนักงานภายในโรงงาน"
                    />

                    <InputField
                        label="ชื่อลูกค้า / ชื่อโครงการ"
                        name="customer_name"
                        placeholder="เช่น บริษัทตัวอย่าง A"
                    />

                    <InputField
                        label="สถานที่"
                        name="location"
                        placeholder="เช่น นิคมอุตสาหกรรม / อาคารสำนักงาน / ลานจอดรถ"
                    />

                    <InputField
                        label="วันที่ติดตั้ง"
                        name="installed_at"
                        type="date"
                    />
                </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-950">ประเภทและตัวกรอง</h2>

                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    <SelectField label="หมวดระบบ" name="category_id" options={categories} />
                    <SelectField label="ประเภทสถานที่" name="site_type_id" options={siteTypes} />
                    <SelectField label="ประเภทประตู" name="door_type_id" options={doorTypes} />
                    <SelectField label="ประเภทระบบหลัก" name="primary_system_type_id" options={systemTypes} />
                </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-950">ข้อมูลเชิงธุรกิจ</h2>

                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    <InputField
                        label="งบประมาณต่ำสุด"
                        name="budget_min"
                        type="number"
                        placeholder="35000"
                    />

                    <InputField
                        label="งบประมาณสูงสุด"
                        name="budget_max"
                        type="number"
                        placeholder="65000"
                    />

                    <InputField
                        label="จำนวนผู้ใช้งาน"
                        name="user_count"
                        type="number"
                        placeholder="300"
                    />

                    <InputField
                        label="ระยะเวลาติดตั้ง วัน"
                        name="installation_days"
                        type="number"
                        placeholder="2"
                    />
                </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-950">รายละเอียดหน้างาน</h2>

                <div className="mt-6 space-y-5">
                    <TextareaField
                        label="ปัญหา / โจทย์ของลูกค้า"
                        name="problem_statement"
                        placeholder="ลูกค้าต้องการควบคุมการเข้าออก..."
                    />

                    <TextareaField
                        label="Requirement / สิ่งที่ลูกค้าต้องการ"
                        name="requirement_summary"
                        placeholder="ต้องการระบบที่รองรับพนักงานจำนวนมาก..."
                    />

                    <TextareaField
                        label="Solution / วิธีแก้ที่ติดตั้งจริง"
                        name="solution_statement"
                        placeholder="ติดตั้งเครื่องสแกนใบหน้า พร้อมชุดกลอนไฟฟ้า..."
                    />

                    <TextareaField
                        label="Installation Notes / ข้อควรรู้หน้างาน"
                        name="installation_notes"
                        placeholder="ตรวจสอบไฟเลี้ยง จุดเดินสาย และตำแหน่งติดตั้ง..."
                    />

                    <TextareaField
                        label="Sales Notes / ข้อความช่วยขายสำหรับเซล"
                        name="sales_notes"
                        placeholder="เหมาะสำหรับลูกค้าโรงงานที่ต้องการควบคุมพื้นที่เฉพาะ..."
                    />

                    <TextareaField
                        label="Tech Notes / หมายเหตุสำหรับทีมเทคนิค"
                        name="tech_notes"
                        placeholder="ข้อมูลภายในสำหรับทีมเทคนิค ไม่จำเป็นต้องเปิดให้ลูกค้าดู..."
                    />

                    <TextareaField
                        label="Customer Visible Notes / ข้อความที่เปิดให้ลูกค้าดูได้"
                        name="customer_visible_notes"
                        placeholder="ระบบนี้ช่วยให้ลูกค้าควบคุมการเข้าออกได้ชัดเจน..."
                    />
                </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-950">สถานะการเผยแพร่</h2>

                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Status
                        </label>

                        <select
                            name="status"
                            defaultValue="draft"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none"
                        >
                            <option value="draft">Draft - ยังไม่แสดงหน้าบ้าน</option>
                            <option value="published">Published - แสดงหน้าบ้าน</option>
                            <option value="archived">Archived - ซ่อนเก็บไว้</option>
                        </select>
                    </div>

                    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <input
                            type="checkbox"
                            name="is_featured"
                            className="h-5 w-5 rounded border-slate-300"
                        />
                        <span className="text-sm font-semibold text-slate-700">
                            ตั้งเป็นเคสแนะนำหน้าแรก
                        </span>
                    </label>
                </div>
            </section>

            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    บันทึกเคส
                </button>

                <a
                    href="/admin/cases"
                    className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
                >
                    ยกเลิก
                </a>
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
}: {
    label: string
    name: string
    type?: string
    placeholder?: string
    helper?: string
    required?: boolean
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
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none transition focus:border-slate-400"
            />

            {helper ? (
                <p className="mt-2 text-xs text-slate-500">{helper}</p>
            ) : null}
        </div>
    )
}

function SelectField({
    label,
    name,
    options,
}: {
    label: string
    name: string
    options: CaseFormOption[]
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <select
                name={name}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none"
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
}: {
    label: string
    name: string
    placeholder?: string
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
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-400"
            />
        </div>
    )
}
