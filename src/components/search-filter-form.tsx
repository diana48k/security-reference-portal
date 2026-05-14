import Link from 'next/link'
import { Filter, Search } from 'lucide-react'

import type {
  SearchFilterOptions,
  SearchFilters,
} from '@/src/lib/queries/search'

type SearchFilterFormProps = {
  filters: SearchFilters
  options: SearchFilterOptions
}

function SelectField({
  label,
  name,
  value,
  options,
}: {
  label: string
  name: string
  value: string
  options: SearchFilterOptions[keyof SearchFilterOptions]
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select
        name={name}
        defaultValue={value}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
      >
        <option value="">ทั้งหมด</option>
        {options.map((option) => (
          <option key={option.slug} value={option.slug}>
            {option.name_th}
          </option>
        ))}
      </select>
    </label>
  )
}

export function SearchFilterForm({ filters, options }: SearchFilterFormProps) {
  return (
    <form
      action="/search"
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-5 flex items-center gap-2">
        <Filter className="h-5 w-5 text-slate-500" />
        <h2 className="font-bold text-slate-950">ค้นหาและกรองเคส</h2>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Keyword</span>
        <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-slate-400">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="ประตูกระจก, โรงงาน, LPR..."
            className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
          />
        </div>
      </label>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SelectField
          label="หมวดระบบ"
          name="category"
          value={filters.category}
          options={options.categories}
        />
        <SelectField
          label="ประเภทสถานที่"
          name="siteType"
          value={filters.siteType}
          options={options.siteTypes}
        />
        <SelectField
          label="ประเภทประตู"
          name="doorType"
          value={filters.doorType}
          options={options.doorTypes}
        />
        <SelectField
          label="ประเภทระบบ"
          name="systemType"
          value={filters.systemType}
          options={options.systemTypes}
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            งบประมาณสูงสุด
          </span>
          <input
            name="budget"
            type="number"
            min="0"
            step="1000"
            defaultValue={filters.budget}
            placeholder="เช่น 100000"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <label className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="featured"
              value="true"
              defaultChecked={filters.featured}
              className="h-4 w-4"
            />
            เคสแนะนำ
          </label>
          <label className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="hasImages"
              value="true"
              defaultChecked={filters.hasImages}
              className="h-4 w-4"
            />
            มีรูปจริง
          </label>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          ค้นหาเคส
        </button>
        <Link
          href="/search"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          ล้างตัวกรอง
        </Link>
      </div>
    </form>
  )
}
