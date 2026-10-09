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
    <header className="sticky top-0 z-10 border-b border-sim-border/50 bg-sim-bg/85 shadow-sm backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex min-h-[68px] w-[calc(100%-32px)] max-w-[1180px] flex-wrap items-center gap-3 sm:min-h-[76px] sm:w-[calc(100%-48px)] sm:flex-nowrap sm:gap-7">
        
        {/* LOGO AREA */}
        <NavLink
          to="/"
          end
          aria-label={`${siteConfig.name} home`}
          className="group mr-auto flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sim-cyan/50"
        >
          <span className="relative grid size-7 place-items-center rounded-full border border-sim-cyan shadow-[0_0_28px_rgba(107,227,223,0.18)] transition-all duration-300 group-hover:border-sim-cyan/80 group-hover:shadow-[0_0_28px_rgba(107,227,223,0.35)]">
            <span className="absolute h-px w-3.5 bg-sim-cyan transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute h-3.5 w-px bg-sim-cyan transition-transform duration-300 group-hover:scale-110" />
            <span className="size-1.5 rounded-full bg-sim-cyan transition-transform duration-300 group-hover:scale-125" />
          </span>

          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-sim-text transition-colors group-hover:text-sim-cyan">
              {siteConfig.name}
            </span>
            <span className="text-[9px] uppercase tracking-[0.16em] text-sim-faint">
              {siteConfig.tagline}
            </span>
          </span>
        </NavLink>

        {/* MOBILE MENU TOGGLE */}
        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="group flex items-center gap-2 rounded-md p-2 text-[10px] uppercase tracking-[0.12em] text-sim-muted transition-colors hover:text-sim-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sim-cyan/50 sm:hidden"
        >
          {isMenuOpen ? 'Close' : 'Menu'}
          <span className="flex h-3 w-4 flex-col justify-center gap-1.5 overflow-hidden">
            <span className={`h-px bg-sim-cyan transition-all duration-300 ${isMenuOpen ? 'w-4 translate-y-[3.5px] rotate-45' : 'w-4'}`} />
            <span className={`h-px bg-sim-cyan transition-all duration-300 ${isMenuOpen ? 'w-4 -translate-y-[3.5px] -rotate-45' : 'w-3 group-hover:w-4'}`} />
          </span>
        </button>

        {/* NAVIGATION LINKS */}
        <nav
          id="primary-navigation"
          aria-label="Primary navigation"
          className={`${
            isMenuOpen ? 'flex' : 'hidden'
          } order-3 basis-full flex-col gap-1.5 border-t border-sim-border/50 py-4 sm:order-none sm:flex sm:basis-auto sm:flex-row sm:gap-2 sm:border-0 sm:py-0`}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative rounded-md px-4 py-2.5 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sim-cyan/50 sm:px-3 sm:py-2 ${
                  isActive
                    ? 'border border-sim-cyan/40 bg-sim-cyan/10 text-sim-cyan shadow-[inset_0_0_12px_rgba(107,227,223,0.1)]'
                    : 'border border-transparent text-sim-muted hover:border-sim-border/50 hover:bg-sim-border/10 hover:text-sim-text active:scale-95'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* VERSION INDICATOR */}
        <div className="hidden items-center gap-2 text-[9px] uppercase tracking-[0.13em] text-sim-faint transition-opacity hover:opacity-80 lg:flex">
          <span className="size-1.5 animate-pulse rounded-full bg-sim-cyan shadow-[0_0_10px_rgba(107,227,223,0.8)]" />
          {siteConfig.version}
        </div>
      </div>
    </header>
  )
}