type CaseImage = {
  image_url: string | null
  kind: string
  caption: string | null
  sort_order: number | null
}

const IMAGE_KIND_PRIORITY = ['after', 'gallery', 'before', 'diagram']

export function getPrimaryCaseImage(images: CaseImage[] | null | undefined) {
  if (!images || images.length === 0) {
    return null
  }

  const sortedImages = [...images]
    .filter((image) => image.image_url)
    .sort((a, b) => {
      const priorityA = IMAGE_KIND_PRIORITY.indexOf(a.kind)
      const priorityB = IMAGE_KIND_PRIORITY.indexOf(b.kind)
      const normalizedPriorityA =
        priorityA === -1 ? IMAGE_KIND_PRIORITY.length : priorityA
      const normalizedPriorityB =
        priorityB === -1 ? IMAGE_KIND_PRIORITY.length : priorityB

      if (normalizedPriorityA !== normalizedPriorityB) {
        return normalizedPriorityA - normalizedPriorityB
      }

      return (a.sort_order ?? 0) - (b.sort_order ?? 0)
    })

  return sortedImages[0] ?? null
}

export function formatBudget(min?: number | null, max?: number | null) {
  if (!min && !max) return 'ไม่ระบุงบประมาณ'

  const formatter = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  })

  if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`
  if (min) return `เริ่มต้น ${formatter.format(min)}`
  return `ไม่เกิน ${formatter.format(max ?? 0)}`
}

export function getImagesByKind<
  T extends {
    kind: string
    sort_order: number | null
  },
>(images: T[] | null | undefined, kind: string) {
  if (!images) return []

  return images
    .filter((image) => image.kind === kind)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

export function sortBySortOrder<
  T extends {
    sort_order: number | null
  },
>(items: T[] | null | undefined) {
  if (!items) return []

  return [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

export function formatThaiDate(date?: string | null) {
  if (!date) return 'ไม่ระบุวันที่'

  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}
