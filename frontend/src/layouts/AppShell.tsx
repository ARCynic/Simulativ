import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { TopNav } from '../components/navigation/TopNav'


type SocialIconProps = {
  href: string
  label: string
  icon: ReactNode
}

export function AppShell() {
  const year = new Date().getFullYear()

  return (
    <div className="min-h-screen">
      <TopNav />

      <main className="min-h-[calc(100vh-140px)]">
        <Outlet />
      </main>

      <footer className="relative z-20 mt-2 border-t border-white/15 bg-black/60 shadow-[0_-10px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="mx-auto w-full max-w-screen-2xl px-2 py-6">
          <div className="flex items-center justify-between gap-6">
            <p className="whitespace-nowrap text-sm text-white/60">
              © {year}{' '}
              <a
                href="https://polymathictrail.space"
                className="text-cyan-300 hover:text-emerald-200 hover:underline hover:underline-offset-4"
              >
                Polymathic Trail
              </a>
              .
              <span className="hidden sm:inline">
                {' '}
                All rights reserved.
              </span>
            </p>

            <div className="flex items-center gap-3 whitespace-nowrap">
              <SocialIcon
                href="https://github.com/ARCynic"
                label="GitHub"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2a10 10 0 0 0-3.162 19.488c.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.776.603-3.362-1.338-3.362-1.338a2.645 2.645 0 0 0-1.107-1.46c-.905-.62.069-.607.069-.607 1.002.071 1.529 1.03 1.529 1.03.89 1.526 2.337 1.086 2.906.83.09-.645.349-1.086.636-1.336-2.217-.252-4.55-1.109-4.55-4.935 0-1.09.39-1.984 1.03-2.683-.103-.253-.447-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.57 9.57 0 0 1 12 6.844c.85.004 1.706.115 2.505.337 1.909-1.295 2.748-1.026 2.748-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.593 1.028 2.683 0 3.836-2.337 4.68-4.56 4.928.359.31.678.92.678 1.854 0 1.337-.012 2.415-.012 2.743 0 .268.18.58.688.482A10 10 0 0 0 12 2Z"
                    />
                  </svg>
                }
              />

              <SocialIcon
                href="https://x.com/Cynically_Stoic"
                label="Twitter"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M18.9 2H22l-6.77 7.73L23.5 22h-6.7l-5.24-6.44L5.9 22H2.8l7.3-8.34L1 2h6.86l4.74 5.9L18.9 2Zm-1.2 18h1.86L7.74 3.88H5.76L17.7 20Z" />
                  </svg>
                }
              />

              <SocialIcon
                href="https://www.instagram.com/arcynic_/"
                label="Instagram"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2Zm0 2A2.8 2.8 0 1 0 14.8 12 2.8 2.8 0 0 0 12 9.2Zm5.3-2.5a1.1 1.1 0 1 1-1.1 1.1 1.1 0 0 1 1.1-1.1Z" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SocialIcon({ href, label, icon }: SocialIconProps) {
  return (
    <a
      href={href}
      aria-label={label}
      className={[
        'inline-flex h-10 w-10 items-center justify-center rounded-xl',
        'bg-white/5 text-white/70 ring-1 ring-white/10',
        'transition hover:bg-white/10 hover:text-white hover:ring-white/20',
      ].join(' ')}
    >
      {icon}
    </a>
  )
}