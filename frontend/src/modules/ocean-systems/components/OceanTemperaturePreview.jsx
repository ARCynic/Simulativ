import { useEffect, useMemo, useState } from 'react'

const DATA_URL = '/data/copernicus_marine/temperature.json'

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
}

function getTemperatureColor(value, minimum, maximum) {
  if (!Number.isFinite(value)) {
    return 'transparent'
  }

  const ratio =
    maximum === minimum
      ? 0.5
      : clamp((value - minimum) / (maximum - minimum), 0, 1)

  const hue = 220 - ratio * 180

  return `hsl(${hue} 85% 52%)`
}

function formatTemperature(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)} °C` : 'No data'
}

export function OceanTemperaturePreview() {
  const [dataset, setDataset] = useState(null)
  const [timeIndex, setTimeIndex] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadDataset() {
      try {
        const response = await fetch(DATA_URL)

        if (!response.ok) {
          throw new Error(`Dataset request failed: ${response.status}`)
        }

        const data = await response.json()

        if (!cancelled) {
          setDataset(data)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load ocean dataset.',
          )
        }
      }
    }

    loadDataset()

    return () => {
      cancelled = true
    }
  }, [])

  const model = useMemo(() => {
    if (!dataset || !Array.isArray(dataset.records)) {
      return null
    }

    const records = dataset.records

    const times = [...new Set(records.map((record) => record.time))].sort()

    const activeTime = times[timeIndex] ?? times[0]

    const frameRecords = records.filter(
      (record) => record.time === activeTime,
    )

    const latitudes = [
      ...new Set(frameRecords.map((record) => Number(record.latitude))),
    ].sort((a, b) => b - a)

    const longitudes = [
      ...new Set(frameRecords.map((record) => Number(record.longitude))),
    ].sort((a, b) => a - b)

    const lookup = new Map(
      frameRecords.map((record) => [
        `${record.latitude}:${record.longitude}`,
        Number(record.temperature_c),
      ]),
    )

    const values = records
      .map((record) => Number(record.temperature_c))
      .filter(Number.isFinite)

    return {
      times,
      activeTime,
      latitudes,
      longitudes,
      lookup,
      minimum: Math.min(...values),
      maximum: Math.max(...values),
    }
  }, [dataset, timeIndex])

  if (error) {
    return (
      <section className="rounded-3xl border border-red-300 bg-red-50 p-6 text-red-800">
        <h2 className="mb-2 text-lg font-semibold">
          Ocean dataset could not be loaded
        </h2>
        <p className="text-sm">{error}</p>
      </section>
    )
  }

  if (!dataset || !model) {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-white p-6">
        <p className="text-sm text-slate-600">
          Loading Copernicus Marine data…
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Copernicus Marine
          </p>

          <h2 className="text-2xl font-semibold text-slate-900">
            Near-surface ocean temperature
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Global Ocean Physics Reanalysis sample
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <div className="font-semibold">{model.activeTime}</div>
          <div className="text-xs">
            {model.latitudes.length} × {model.longitudes.length} grid
          </div>
        </div>
      </div>

      <div className="mb-5 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-3">
        <div
          className="grid min-w-[760px] gap-px"
          style={{
            gridTemplateColumns: `repeat(${model.longitudes.length}, minmax(0, 1fr))`,
            gridAutoRows: '10px',
          }}
        >
          {model.latitudes.flatMap((latitude) =>
            model.longitudes.map((longitude) => {
              const key = `${latitude}:${longitude}`
              const value = model.lookup.get(key)

              return (
                <div
                  key={key}
                  title={`${latitude.toFixed(2)}°, ${longitude.toFixed(
                    2,
                  )}° — ${formatTemperature(value)}`}
                  className="min-w-0"
                  style={{
                    backgroundColor: getTemperatureColor(
                      value,
                      model.minimum,
                      model.maximum,
                    ),
                  }}
                />
              )
            }),
          )}
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between text-xs text-slate-500">
        <span>
          {model.minimum.toFixed(1)} °C
        </span>

        <div className="h-2 w-40 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 via-yellow-300 to-red-500" />

        <span>
          {model.maximum.toFixed(1)} °C
        </span>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Date

        <input
          type="range"
          min="0"
          max={Math.max(model.times.length - 1, 0)}
          value={timeIndex}
          onChange={(event) => setTimeIndex(Number(event.target.value))}
          className="mt-3 w-full accent-emerald-600"
        />
      </label>

      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>{model.times[0]}</span>
        <span>{model.times[model.times.length - 1]}</span>
      </div>
    </section>
  )
}