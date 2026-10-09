import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { navItems, siteConfig } from '../../config/site'

export function TopNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-sim-border/60 bg-sim-bg/90 bg-[linear-gradient(to_right,rgba(82,116,92,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(82,116,92,0.06)_1px,transparent_1px)] bg-[size:42px_42px] shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] w-[calc(100%-24px)] max-w-[1280px] flex-wrap items-center gap-4 sm:w-[calc(100%-48px)]">
        <NavLink
          to="/"
          end
          aria-label={`${siteConfig.name} home`}
          className="group mr-auto flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sim-cyan/50"
        >
          <span className="relative grid h-11 w-11 place-items-center">
  <span className="absolute inset-0 rounded-full bg-emerald-400/40 blur-xl transition-all duration-300 group-hover:bg-emerald-400/60 group-hover:blur-2xl" />

  <span className="pointer-events-none absolute inset-1 z-20 rounded-xl bg-emerald-300/20 mix-blend-color" />

  <img
    src="/logo_simulativ.png"
    alt=""
    aria-hidden="true"
    className="relative z-10 h-11 w-11 object-contain brightness-100 saturate-[1.2] drop-shadow-[0_0_8px_rgba(74,160,91,0.85)] transition-transform duration-300 group-hover:scale-[1.08]"
  />
</span>

          <span className="flex flex-col leading-none">
        <span className="bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text font-mono text-xl font-bold tracking-[-0.04em] text-transparent transition-all duration-300 group-hover:from-green-600 group-hover:via-emerald-500 group-hover:to-lime-400">
          {siteConfig.name}
        </span>

        <span className="mt-1 bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 bg-clip-text font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-transparent">
          {siteConfig.tagline ?? 'Public data / systems / simulation'}
        </span>
      </span>
        </NavLink>

        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="group flex items-center gap-2 rounded-full border border-sim-border bg-sim-surface/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-sim-muted transition-colors hover:text-sim-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sim-cyan/50 sm:hidden"
        >
          {isMenuOpen ? 'Close' : 'Menu'}

          <span className="flex h-3 w-4 flex-col justify-center gap-1.5 overflow-hidden">
            <span
              className={`h-px bg-sim-cyan transition-all duration-300 ${
                isMenuOpen
                  ? 'w-4 translate-y-[3.5px] rotate-45'
                  : 'w-4'
              }`}
            />

            <span
              className={`h-px bg-sim-cyan transition-all duration-300 ${
                isMenuOpen
                  ? 'w-4 -translate-y-[3.5px] -rotate-45'
                  : 'w-3 group-hover:w-4'
              }`}
            />
          </span>
        </button>

        <nav
          id="primary-navigation"
          aria-label="Primary navigation"
          className={`${
            isMenuOpen ? 'flex' : 'hidden'
          } order-3 basis-full sm:order-none sm:flex sm:basis-auto`}
        >
          <div className="flex w-full flex-col gap-1 rounded-3xl border border-sim-border/70 bg-sim-surface/75 p-1.5 shadow-[0_8px_30px_rgba(74,130,84,0.08)] backdrop-blur-md sm:w-auto sm:flex-row sm:items-center sm:rounded-full">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex min-h-10 flex-1 items-center justify-center rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sim-cyan/50 sm:min-h-9 sm:flex-none sm:px-4 ${
                    isActive
                      ? 'bg-gradient-to-r from-lime-200 via-emerald-200 to-green-300 text-emerald-950 shadow-[0_4px_18px_rgba(74,160,91,0.22)]'
                      : 'text-sim-muted hover:bg-sim-bg/80 hover:text-sim-text active:scale-95'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="hidden items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.13em] text-sim-faint transition-opacity hover:opacity-80 lg:flex">
          <span className="size-1.5 animate-pulse rounded-full bg-sim-cyan shadow-[0_0_10px_rgba(74,160,91,0.65)]" />
          {siteConfig.version}
        </div>
      </div>
    </header>
  )
}