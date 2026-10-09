type SectionHeadingProps = {
  eyebrow: string
  title: string
  description: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mb-9 max-w-2xl">
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-sim-cyan">
        {eyebrow}
      </p>

      <h2 className="mb-3 text-3xl leading-none text-sim-text sm:text-5xl">
        {title}
      </h2>

      <p className="max-w-xl text-sm text-sim-muted">
        {description}
      </p>
    </div>
  )
}