import Link from 'next/link'

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
        <h2 className="text-xl font-bold text-slate-950">Case details</h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <InputField
            label="Case title"
            name="title"
            placeholder="Factory access control installation"
            defaultValue={caseStudy?.title}
            required
          />

          <InputField
            label="Slug URL"
            name="slug"
            placeholder="factory-access-control-glass-door"
            helper="Leave blank on create to generate from the title."
            defaultValue={caseStudy?.slug}
          />

          <InputField
            label="Subtitle"
            name="subtitle"
            placeholder="Short summary for cards and detail page"
            defaultValue={caseStudy?.subtitle}
          />

          <InputField
            label="Customer / project"
            name="customer_name"
            placeholder="Example Customer A"
            defaultValue={caseStudy?.customer_name}
          />

          <InputField
            label="Location"
            name="location"
            placeholder="Factory, office, carpark, warehouse"
            defaultValue={caseStudy?.location}
          />

          <InputField
            label="Installed date"
            name="installed_at"
            type="date"
            defaultValue={dateValue(caseStudy?.installed_at)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Taxonomy</h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <SelectField
            label="Category"
            name="category_id"
            options={categories}
            defaultValue={caseStudy?.category_id}
          />
          <SelectField
            label="Site type"
            name="site_type_id"
            options={siteTypes}
            defaultValue={caseStudy?.site_type_id}
          />
          <SelectField
            label="Door type"
            name="door_type_id"
            options={doorTypes}
            defaultValue={caseStudy?.door_type_id}
          />
          <SelectField
            label="Primary system"
            name="primary_system_type_id"
            options={systemTypes}
            defaultValue={caseStudy?.primary_system_type_id}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Commercial details</h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <InputField
            label="Budget min"
            name="budget_min"
            type="number"
            placeholder="35000"
            defaultValue={numberValue(caseStudy?.budget_min)}
          />

          <InputField
            label="Budget max"
            name="budget_max"
            type="number"
            placeholder="65000"
            defaultValue={numberValue(caseStudy?.budget_max)}
          />

          <InputField
            label="User count"
            name="user_count"
            type="number"
            placeholder="300"
            defaultValue={numberValue(caseStudy?.user_count)}
          />

          <InputField
            label="Installation days"
            name="installation_days"
            type="number"
            placeholder="2"
            defaultValue={numberValue(caseStudy?.installation_days)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Project notes</h2>

        <div className="mt-6 space-y-5">
          <TextareaField
            label="Problem statement"
            name="problem_statement"
            placeholder="What problem did the customer need to solve?"
            defaultValue={caseStudy?.problem_statement}
          />

          <TextareaField
            label="Requirement summary"
            name="requirement_summary"
            placeholder="Main requirements and constraints"
            defaultValue={caseStudy?.requirement_summary}
          />

          <TextareaField
            label="Solution statement"
            name="solution_statement"
            placeholder="Installed solution and equipment approach"
            defaultValue={caseStudy?.solution_statement}
          />

          <TextareaField
            label="Installation notes"
            name="installation_notes"
            placeholder="Site notes, wiring, mounting, survey points"
            defaultValue={caseStudy?.installation_notes}
          />

          <TextareaField
            label="Sales notes"
            name="sales_notes"
            placeholder="Internal selling points for the sales team"
            defaultValue={caseStudy?.sales_notes}
          />

          <TextareaField
            label="Tech notes"
            name="tech_notes"
            placeholder="Internal notes for technical team"
            defaultValue={caseStudy?.tech_notes}
          />

          <TextareaField
            label="Customer visible notes"
            name="customer_visible_notes"
            placeholder="Public-facing notes shown on the case page"
            defaultValue={caseStudy?.customer_visible_notes}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Publishing</h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </label>

            <select
              name="status"
              defaultValue={caseStudy?.status ?? 'draft'}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none"
            >
              <option value="draft">Draft - hidden from public pages</option>
              <option value="published">Published - visible publicly</option>
              <option value="archived">Archived - hidden from public pages</option>
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
              Featured on home page
            </span>
          </label>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {mode === 'edit' ? 'Save changes' : 'Create case'}
        </button>

        <Link
          href="/admin/cases"
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
        >
          Cancel
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
        <option value="">Not specified</option>

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
