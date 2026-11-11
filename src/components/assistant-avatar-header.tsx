import Image from "next/image";
import type { ReactNode } from "react";
import type { AssistantSettings } from "@/src/lib/assistant/config";

const logo = "/brand/tigersoft-logo.png";

export function AssistantAvatarHeader({
  settings,
  avatar,
  status,
  controls,
  className = "h-60",
}: {
  settings: Pick<AssistantSettings, "name" | "color" | "avatarFraming">;
  avatar?: string;
  status: string;
  controls?: ReactNode;
  className?: string;
}) {
  const { zoom, x, y } = settings.avatarFraming;
  return (
    <header
      className={`relative isolate shrink-0 overflow-hidden bg-[linear-gradient(150deg,#0b223e_12%,#1d3b5a_56%,transparent)] text-white ${className}`}
      style={{ backgroundColor: settings.color }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-12 bottom-0"
        aria-hidden="true"
      >
        {avatar ? (
          <div className="absolute inset-0 motion-reduce:hidden">
            <Image
              unoptimized
              src={avatar}
              alt=""
              fill
              className="origin-bottom object-contain object-bottom"
              style={{
                transform: `translate(${x}%, ${y}%) scale(${zoom / 100})`,
              }}
            />
          </div>
        ) : null}
        <div
          className={`absolute inset-0 place-items-center ${avatar ? "hidden motion-reduce:grid" : "grid"}`}
        >
          <span className="relative h-[55%] max-h-20 w-20">
            <Image
              src={logo}
              alt=""
              fill
              sizes="80px"
              className="object-contain"
            />
          </span>
        </div>
      </div>
      <div className="relative flex items-center gap-2 bg-linear-to-b from-slate-950/75 to-transparent px-3 py-2 sm:px-4">
        <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-white p-1.5">
          <Image src={logo} alt="" width={20} height={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold sm:text-base">
            {settings.name}
          </h2>
          <p className="truncate text-xs text-slate-100">{status}</p>
        </div>
        {controls}
      </div>
    </header>
  );
}
