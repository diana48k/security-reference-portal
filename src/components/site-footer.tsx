export function SiteFooter({ label = 'Internal sales enablement use.' }: { label?: string }) {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-5 text-center text-xs text-slate-500">
      © Tigersoft Installation Reference Portal. {label}
    </footer>
  )
}
