import { HelpCircle, Trash2 } from 'lucide-react'

import { ConfirmActionButton } from '@/src/components/confirm-action-button'
import { SubmitButton } from '@/src/components/submit-button'
import {
  createFaqAction,
  deleteFaqAction,
  updateFaqAction,
} from '@/src/lib/actions/faqs'
import {
  getAdminFaqPageData,
  type AdminFaq,
  type AdminFaqCaseOption,
  type AdminFaqCategoryOption,
} from '@/src/lib/queries/admin-faqs'

export const metadata = {
  title: 'FAQs | Security Reference Portal',
}

export default async function AdminFaqsPage() {
  const { faqs, categories, cases } = await getAdminFaqPageData()

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-slate-950 p-8 text-white shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Admin FAQ
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Manage FAQs
            </h1>
            <p className="mt-3 max-w-3xl text-slate-300">
              Add global FAQs for the home page or attach FAQs to a specific
              case detail page.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Add FAQ</h2>
        <FaqForm action={createFaqAction} categories={categories} cases={cases} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">FAQ list</h2>
            <p className="mt-1 text-sm text-slate-600">
              {faqs.length.toLocaleString('en-US')} FAQs
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {faqs.length > 0 ? (
            faqs.map((faq) => (
              <FaqItem
                key={faq.id}
                faq={faq}
                categories={categories}
                cases={cases}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No FAQs yet.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function FaqItem({
  faq,
  categories,
  cases,
}: {
  faq: AdminFaq
  categories: AdminFaqCategoryOption[]
  cases: AdminFaqCaseOption[]
}) {
  return (
    <article className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
          {faq.is_active ? 'Active' : 'Inactive'}
        </span>
        {faq.is_global ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
            Global
          </span>
        ) : null}
        {faq.categories ? (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
            {faq.categories.name_th}
          </span>
        ) : null}
        {faq.case_studies ? (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
            {faq.case_studies.title}
          </span>
        ) : null}
      </div>

      <FaqForm
        action={updateFaqAction}
        faq={faq}
        categories={categories}
        cases={cases}
      />

      <form action={deleteFaqAction} className="mt-3">
        <input type="hidden" name="id" value={faq.id} />
        <ConfirmActionButton
          confirmMessage={`Delete FAQ "${faq.question}"?`}
          pendingText="Deleting..."
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </ConfirmActionButton>
      </form>
    </article>
  )
}

function FaqForm({
  action,
  faq,
  categories,
  cases,
}: {
  action: (formData: FormData) => Promise<void>
  faq?: AdminFaq
  categories: AdminFaqCategoryOption[]
  cases: AdminFaqCaseOption[]
}) {
  return (
    <form action={action} className="mt-5 grid gap-4">
      {faq ? <input type="hidden" name="id" value={faq.id} /> : null}

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Question
        </span>
        <input
          name="question"
          required
          defaultValue={faq?.question ?? ''}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Answer
        </span>
        <textarea
          name="answer"
          rows={4}
          required
          defaultValue={faq?.answer ?? ''}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <Select
          label="Category"
          name="category_id"
          value={faq?.category_id ?? ''}
          options={categories.map((category) => ({
            value: category.id,
            label: category.name_th,
          }))}
        />
        <Select
          label="Case"
          name="case_id"
          value={faq?.case_id ?? ''}
          options={cases.map((caseStudy) => ({
            value: caseStudy.id,
            label: caseStudy.title,
          }))}
        />
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Sort
          </span>
          <input
            name="sort_order"
            type="number"
            defaultValue={faq?.sort_order ?? 0}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            name="is_global"
            defaultChecked={faq?.is_global ?? true}
            className="h-4 w-4"
          />
          Global
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={faq?.is_active ?? true}
            className="h-4 w-4"
          />
          Active
        </label>
      </div>

      <div>
        <SubmitButton
          pendingText={faq ? 'Saving...' : 'Adding...'}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {faq ? 'Save FAQ' : 'Add FAQ'}
        </SubmitButton>
      </div>
    </form>
  )
}

function Select({
  label,
  name,
  value,
  options,
}: {
  label: string
  name: string
  value: string
  options: Array<{ value: string; label: string }>
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
      >
        <option value="">None</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
