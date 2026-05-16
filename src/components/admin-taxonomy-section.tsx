import { Eye, EyeOff } from 'lucide-react'

import { ConfirmActionButton } from '@/src/components/confirm-action-button'
import { SubmitButton } from '@/src/components/submit-button'
import {
  activateTaxonomyAction,
  createTaxonomyAction,
  deactivateTaxonomyAction,
  updateTaxonomyAction,
} from '@/src/lib/actions/taxonomy'
import type {
  AdminTaxonomyItem,
  AdminTaxonomySectionData,
} from '@/src/lib/queries/admin-taxonomy'

type AdminTaxonomySectionProps = {
  section: AdminTaxonomySectionData
}

export function AdminTaxonomySection({ section }: AdminTaxonomySectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">{section.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{section.description}</p>
        </div>
        <div className="text-sm font-semibold text-slate-500">
          {section.items.length.toLocaleString('en-US')} items
        </div>
      </div>

      <form
        action={createTaxonomyAction}
        className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 lg:grid-cols-6"
      >
        <input type="hidden" name="table" value={section.table} />
        <Input name="name_th" label="Name TH" required />
        <Input name="name_en" label="Name EN" />
        <Input name="slug" label="Slug" />
        {section.supportsSortOrder ? (
          <Input name="sort_order" label="Sort" type="number" defaultValue="0" />
        ) : null}
        {section.supportsCategoryFields ? (
          <>
            <Input name="icon" label="Icon" />
            <Input name="description" label="Description" />
          </>
        ) : null}
        <label className="flex items-end gap-2 pb-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked
            className="h-4 w-4"
          />
          Active
        </label>
        <div className="flex items-end">
          <SubmitButton
            pendingText="Adding..."
            className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Add
          </SubmitButton>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {section.items.map((item) => (
          <TaxonomyItemForm
            key={item.id}
            item={item}
            section={section}
          />
        ))}
      </div>
    </section>
  )
}

function TaxonomyItemForm({
  item,
  section,
}: {
  item: AdminTaxonomyItem
  section: AdminTaxonomySectionData
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <form
        action={updateTaxonomyAction}
        className="grid gap-3 lg:grid-cols-6"
      >
        <input type="hidden" name="table" value={section.table} />
        <input type="hidden" name="id" value={item.id} />
        <Input name="name_th" label="Name TH" defaultValue={item.name_th} required />
        <Input name="name_en" label="Name EN" defaultValue={item.name_en ?? ''} />
        <Input name="slug" label="Slug" defaultValue={item.slug} required />
        {section.supportsSortOrder ? (
          <Input
            name="sort_order"
            label="Sort"
            type="number"
            defaultValue={String(item.sort_order ?? 0)}
          />
        ) : null}
        {section.supportsCategoryFields ? (
          <>
            <Input name="icon" label="Icon" defaultValue={item.icon ?? ''} />
            <Input
              name="description"
              label="Description"
              defaultValue={item.description ?? ''}
            />
          </>
        ) : null}
        <label className="flex items-end gap-2 pb-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={item.is_active}
            className="h-4 w-4"
          />
          Active
        </label>
        <div className="flex items-end gap-2">
          <SubmitButton
            pendingText="Saving..."
            className="h-11 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Save
          </SubmitButton>
        </div>
      </form>

      <form
        action={
          item.is_active ? deactivateTaxonomyAction : activateTaxonomyAction
        }
        className="mt-3"
      >
        <input type="hidden" name="table" value={section.table} />
        <input type="hidden" name="id" value={item.id} />
        <ConfirmActionButton
          confirmMessage={
            item.is_active
              ? `Deactivate "${item.name_th}"? It will disappear from public filters and case forms.`
              : `Activate "${item.name_th}"? It will be available in public filters and case forms.`
          }
          pendingText={item.is_active ? 'Deactivating...' : 'Activating...'}
          className={
            item.is_active
              ? 'inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100'
              : 'inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100'
          }
        >
          {item.is_active ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          {item.is_active ? 'Deactivate' : 'Activate'}
        </ConfirmActionButton>
      </form>
    </div>
  )
}

function Input({
  label,
  name,
  type = 'text',
  defaultValue,
  required,
}: {
  label: string
  name: string
  type?: string
  defaultValue?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
      />
    </label>
  )
}
