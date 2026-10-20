import { useEffect, useMemo, useState } from 'react'

import { MigrationMap } from '../../components/MigrationMap'
import {
  DEFAULT_COUNTRY_CODE,
  getMigrationSnapshot,
  MIGRATION_YEARS,
  migrationDataNote,
  type MigrationMetric,
} from '../../data/migration/frontend_migrationData'

const metricLabels: Record<MigrationMetric, string> = {
  inboundStock: 'Migrant stock living in country',
  share: 'Migrant share of population',
}

const numberFormatter = new Intl.NumberFormat('en', {
  maximumFractionDigits: 0,
})

const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 2,
})

function formatMigrationStock(value: number) {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000

    return `${millions >= 10 ? millions.toFixed(1) : millions.toFixed(2)}M`
  }

  return numberFormatter.format(value)
}

function formatCompact(value: number) {
  return compactFormatter.format(value)
}

export function MigrationPage() {
  const initialYearIndex = Math.max(
    0,
    MIGRATION_YEARS.length - 1,
  )

  const [yearIndex, setYearIndex] = useState(
    initialYearIndex,
  )

  const [metric, setMetric] =
    useState<MigrationMetric>('inboundStock')

  const [selectedCountryCode, setSelectedCountryCode] =
    useState(DEFAULT_COUNTRY_CODE)

  const [isPlaying, setIsPlaying] = useState(false)

  const selectedYear =
    MIGRATION_YEARS[yearIndex] ?? MIGRATION_YEARS[0]

  const snapshot = useMemo(
    () => getMigrationSnapshot(selectedYear),
    [selectedYear],
  )

  const selectedCountry =
    snapshot.countries.find(
      (country) => country.iso3 === selectedCountryCode,
    ) ?? snapshot.countries[0]

  const selectedCountryIso3 =
    selectedCountry?.iso3 ?? ''

  const outgoingFlows = useMemo(
    () =>
      snapshot.flows
        .filter(
          (flow) =>
            flow.originIso3 === selectedCountryIso3,
        )
        .sort(
          (a, b) =>
            b.migrantStock - a.migrantStock,
        ),
    [snapshot.flows, selectedCountryIso3],
  )

  const timelineAtEnd =
    yearIndex >= MIGRATION_YEARS.length - 1

  const progressPercent =
    MIGRATION_YEARS.length <= 1
      ? 100
      : (yearIndex / (MIGRATION_YEARS.length - 1)) * 100

  useEffect(() => {
    if (!isPlaying || timelineAtEnd) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setYearIndex((currentIndex) =>
        Math.min(
          currentIndex + 1,
          MIGRATION_YEARS.length - 1,
        ),
      )
    }, 900)

    return () => window.clearTimeout(timer)
  }, [isPlaying, timelineAtEnd, yearIndex])

  function resetView() {
    setIsPlaying(false)
    setYearIndex(initialYearIndex)
    setMetric('inboundStock')
    setSelectedCountryCode(DEFAULT_COUNTRY_CODE)
  }

  function toggleTimeline() {
    if (timelineAtEnd) {
      setYearIndex(0)
      setIsPlaying(true)
      return
    }

    setIsPlaying((current) => !current)
  }

  return (
    <main className="min-h-screen bg-[#06110f] text-emerald-50">
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-emerald-200/15 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">
              Infrastructure / Migration
            </p>

            <h1 className="text-5xl font-semibold tracking-[-0.05em] text-emerald-50 sm:text-7xl">
              Migration atlas.
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-emerald-100/65 sm:text-lg">
              Explore migrant stock inside countries and
              origin–destination relationships across the
              published UN reference years.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200">
            <span className="size-2 animate-pulse rounded-full bg-emerald-300" />
            Published reference data
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-8 sm:px-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.45fr)] lg:px-8">
        <section className="min-w-0 rounded-[1.75rem] border border-emerald-200/15 bg-[#091c18] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                Country metric / {snapshot.year}
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-emerald-50">
                {metricLabels[metric]}
              </h2>
            </div>

            <span className="w-fit rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">
              UN snapshot
            </span>
          </div>

          <MigrationMap
            countries={snapshot.countries}
            flows={snapshot.flows}
            metric={metric}
            selectedCountryCode={selectedCountryIso3}
            onCountrySelect={setSelectedCountryCode}
          />

          <p className="mt-4 text-xs leading-5 text-emerald-100/45">
            {migrationDataNote}. The map fill represents migrant
            stock living in each country. The connecting lines
            represent the selected origin’s five largest
            destinations.
          </p>
        </section>

        <aside className="rounded-[1.75rem] border border-emerald-200/15 bg-[#091c18] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-emerald-200/10 pb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                Control surface
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-emerald-50">
                Change the frame
              </h2>
            </div>

            <span className="text-xs font-bold tracking-[0.16em] text-emerald-300/70">
              V1
            </span>
          </div>

          <div className="mt-6 space-y-6">
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-100/55">
                Map metric
              </span>

              <select
                value={metric}
                onChange={(event) =>
                  setMetric(
                    event.target.value as MigrationMetric,
                  )
                }
                className="w-full rounded-xl border border-emerald-200/15 bg-[#071714] px-3 py-3 text-sm text-emerald-50 outline-none transition focus:border-emerald-300/60"
              >
                {Object.entries(metricLabels).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-100/55">
                Origin country
              </span>

              <select
                value={selectedCountryIso3}
                onChange={(event) =>
                  setSelectedCountryCode(event.target.value)
                }
                className="w-full rounded-xl border border-emerald-200/15 bg-[#071714] px-3 py-3 text-sm text-emerald-50 outline-none transition focus:border-emerald-300/60"
              >
                {snapshot.countries
                  .slice()
                  .sort((a, b) =>
                    a.name.localeCompare(b.name),
                  )
                  .map((country) => (
                    <option
                      key={country.iso3}
                      value={country.iso3}
                    >
                      {country.name}
                    </option>
                  ))}
              </select>
            </label>

            <div>
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-100/55">
                  Reference year
                </span>

                <strong className="text-xl text-emerald-200">
                  {snapshot.year}
                </strong>
              </div>

              <input
                aria-label="Migration reference year"
                type="range"
                min={0}
                max={Math.max(
                  0,
                  MIGRATION_YEARS.length - 1,
                )}
                step={1}
                value={yearIndex}
                onChange={(event) => {
                  setIsPlaying(false)
                  setYearIndex(Number(event.target.value))
                }}
                className="h-2 w-full cursor-pointer accent-emerald-300"
              />

              <div className="mt-2 flex justify-between text-[10px] text-emerald-100/45">
                <span>{MIGRATION_YEARS[0]}</span>

                <span>
                  {
                    MIGRATION_YEARS[
                      Math.floor(
                        MIGRATION_YEARS.length / 2,
                      )
                    ]
                  }
                </span>

                <span>
                  {MIGRATION_YEARS[
                    MIGRATION_YEARS.length - 1
                  ]}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={toggleTimeline}
                className="rounded-xl bg-emerald-300 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#062018] transition hover:bg-emerald-200"
              >
                {isPlaying && !timelineAtEnd
                  ? 'Pause timeline'
                  : timelineAtEnd
                    ? 'Replay timeline'
                    : 'Play timeline'}
              </button>

              <button
                type="button"
                onClick={resetView}
                className="rounded-xl border border-emerald-200/20 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100/75 transition hover:border-emerald-200/45 hover:text-emerald-50"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-emerald-200/10 pt-5">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-emerald-100/45">
              <span>Timeline position</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-emerald-950">
              <div
                className="h-full rounded-full bg-emerald-300 transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>

            <p className="mt-4 text-xs leading-5 text-emerald-100/50">
              Only published UN reference years are used.
              Migration values are not artificially interpolated.
            </p>
          </div>
        </aside>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-24 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:px-8">
        <section className="rounded-[1.75rem] border border-emerald-200/15 bg-[#091c18] p-5 sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
            Selected origin / {snapshot.year}
          </p>

          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-emerald-50">
                {selectedCountry?.name ?? 'No country selected'}
              </h2>

              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100/40">
                {selectedCountry?.iso3 ?? '—'}
              </p>
            </div>

            <span className="rounded-full border border-emerald-200/15 px-3 py-1.5 text-xs text-emerald-200/70">
              {snapshot.year}
            </span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-emerald-200/10 bg-emerald-200/10">
            <div className="bg-[#071714] p-4">
              <span className="text-[10px] uppercase tracking-[0.12em] text-emerald-100/45">
                Inbound stock
              </span>

              <strong className="mt-2 block text-xl text-emerald-100">
                {selectedCountry
                  ? formatMigrationStock(
                      selectedCountry.inboundMigrantStock,
                    )
                  : '—'}
              </strong>
            </div>

            <div className="bg-[#071714] p-4">
              <span className="text-[10px] uppercase tracking-[0.12em] text-emerald-100/45">
                Population share
              </span>

              <strong className="mt-2 block text-xl text-emerald-100">
                {selectedCountry?.migrantSharePercent === null ||
                selectedCountry?.migrantSharePercent ===
                  undefined
                  ? '—'
                  : `${selectedCountry.migrantSharePercent.toFixed(2)}%`}
              </strong>
            </div>

            <div className="bg-[#071714] p-4">
              <span className="text-[10px] uppercase tracking-[0.12em] text-emerald-100/45">
                Population
              </span>

              <strong className="mt-2 block text-xl text-emerald-100">
                {formatCompact(
                  selectedCountry?.population ?? 0,
                )}
              </strong>
            </div>

            <div className="bg-[#071714] p-4">
              <span className="text-[10px] uppercase tracking-[0.12em] text-emerald-100/45">
                Outbound stock
              </span>

              <strong className="mt-2 block text-xl text-emerald-100">
                {selectedCountry
                  ? formatMigrationStock(
                      selectedCountry.outboundMigrantStock,
                    )
                  : '—'}
              </strong>
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-[1.75rem] border border-emerald-200/15 bg-[#091c18] p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                All destinations / {snapshot.year}
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-emerald-50">
                Migration from{' '}
                {selectedCountry?.name ?? 'selected country'}
              </h2>
            </div>

            <span className="text-xs font-bold tracking-[0.16em] text-emerald-300/70">
              {outgoingFlows.length}
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-200/10">
            <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] gap-3 border-b border-emerald-200/10 bg-[#071714] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100/45">
              <span>#</span>
              <span>Destination</span>
              <span>Migrant stock</span>
            </div>

            <div className="max-h-[520px] divide-y divide-emerald-200/10 overflow-y-auto">
              {outgoingFlows.length > 0 ? (
                outgoingFlows.map((flow, index) => (
                  <div
                    key={`${flow.originIso3}-${flow.destinationIso3}`}
                    className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-sm"
                  >
                    <span className="text-xs text-emerald-100/35">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-emerald-50">
                        {flow.destinationName}
                      </p>

                      <p className="truncate text-xs text-emerald-100/40">
                        {flow.destinationIso3}
                      </p>
                    </div>

                    <strong className="shrink-0 text-emerald-200">
                      {formatMigrationStock(flow.migrantStock)}
                    </strong>
                  </div>
                ))
              ) : (
                <p className="px-4 py-6 text-sm text-emerald-100/50">
                  No origin–destination records are available for this country and year.
                </p>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}