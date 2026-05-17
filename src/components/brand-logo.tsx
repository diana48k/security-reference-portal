import Image from 'next/image'

type BrandLogoProps = {
  tone?: 'light' | 'dark'
  showSystemName?: boolean
}

export function BrandLogo({
  tone = 'dark',
  showSystemName = true,
}: BrandLogoProps) {
  const textClass = tone === 'light' ? 'text-white' : 'text-slate-950'
  const subTextClass = tone === 'light' ? 'text-slate-300' : 'text-slate-500'

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-36 overflow-hidden rounded bg-white">
        <Image
          src="/brand/tigersoft-logo.png"
          alt="Tigersoft"
          fill
          sizes="144px"
          priority
          className="object-contain"
        />
      </div>
      {showSystemName ? (
        <div className="min-w-0">
          <div className={`text-sm font-bold leading-5 ${textClass}`}>
            Tigersoft Installation Reference Portal
          </div>
          <div className={`text-xs leading-4 ${subTextClass}`}>
            Sales & installation reference
          </div>
        </div>
      ) : null}
    </div>
  )
}
