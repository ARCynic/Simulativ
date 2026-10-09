import { ButtonLink } from '../components/ui/ButtonLink'

export function NotFoundPage() {
  return (
    <div>
      <section className="mx-auto min-h-[650px] w-[calc(100%-32px)] max-w-[1180px] py-20 sm:w-[calc(100%-48px)] sm:py-28">
        <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sim-cyan">
          404 / unmapped route
        </p>

        <h1 className="mb-6 max-w-4xl text-6xl leading-[0.92] text-sim-text sm:text-8xl">
          This view does not exist yet.
        </h1>

        <p className="mb-8 max-w-xl text-base text-sim-muted">
          The route is outside the current Simulativ foundation.
        </p>

        <ButtonLink to="/">Return to overview</ButtonLink>
      </section>
    </div>
  )
}