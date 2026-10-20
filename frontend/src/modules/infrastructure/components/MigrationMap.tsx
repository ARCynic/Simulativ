import { useMemo, useState } from 'react'
import type { GeoJsonObject } from 'geojson'
import {
  ComposableMap,
  Geography,
  Geographies,
  Graticule,
} from 'react-simple-maps'
import worldMap from 'world-atlas/countries-110m.json'

import type {
  MigrationCountry,
  MigrationMetric,
} from '../data/migration/frontend_migrationData'

type MigrationMapProps = {
  countries: MigrationCountry[]
  metric: MigrationMetric
  selectedCountryCode: string
  onCountrySelect: (countryCode: string) => void
}

const geography = worldMap as unknown as GeoJsonObject

function metricValue(
  country: MigrationCountry,
  metric: MigrationMetric,
) {
  return metric === 'stock'
    ? country.migrantStockMillions
    : country.migrantSharePercent ?? 0
}

function formatMetricValue(
  country: MigrationCountry,
  metric: MigrationMetric,
) {
  if (metric === 'share') {
    return `${(country.migrantSharePercent ?? 0).toFixed(2)}%`
  }

  return `${country.migrantStockMillions.toFixed(
    country.migrantStockMillions >= 10 ? 1 : 2,
  )}M`
}

function countryFill(
  country: MigrationCountry | undefined,
  metric: MigrationMetric,
  maximum: number,
) {
  if (!country) {
    return '#18332d'
  }

  const intensity = Math.min(
    1,
    metricValue(country, metric) / maximum,
  )

  const red = Math.round(76 - intensity * 44)
  const green = Math.round(145 + intensity * 90)
  const blue = Math.round(108 + intensity * 78)

  return `rgb(${red}, ${green}, ${blue})`
}

export function MigrationMap({
  countries,
  metric,
  selectedCountryCode,
  onCountrySelect,
}: MigrationMapProps) {
  const [hoveredCountryCode, setHoveredCountryCode] = useState<
    string | null
  >(null)

  const countriesByNumericCode = useMemo(
    () =>
      new Map(
        countries
          .filter((country) => country.numericCode)
          .map((country) => [
            country.numericCode as string,
            country,
          ]),
      ),
    [countries],
  )

  const maximum = Math.max(
    ...countries.map((country) =>
      metricValue(country, metric),
    ),
    1,
  )

  const hoveredCountry = countries.find(
    (country) => country.iso3 === hoveredCountryCode,
  )

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-emerald-300/15 bg-[#071714] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(72,190,137,0.16),transparent_55%)]" />

      <div className="relative min-h-[420px] p-2 sm:min-h-[500px] sm:p-5">
        <ComposableMap
          aria-label="World map showing migrant stock by country"
          projection="geoEqualEarth"
          projectionConfig={{
            center: [0, 8],
            scale: 155,
          }}
          width={980}
          height={500}
          className="h-auto w-full"
        >
          <Graticule
            stroke="rgba(120, 214, 171, 0.16)"
            strokeWidth={0.45}
          />

          <Geographies geography={geography}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const code = String(geo.id ?? '').padStart(3, '0')
                const country = countriesByNumericCode.get(code)

                const isSelected =
                  country?.iso3 === selectedCountryCode

                const isHovered =
                  country?.iso3 === hoveredCountryCode

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={
                      isHovered
                        ? '#d8ffea'
                        : countryFill(
                            country,
                            metric,
                            maximum,
                          )
                    }
                    stroke={
                      isSelected
                        ? '#f0fff7'
                        : 'rgba(193, 238, 213, 0.28)'
                    }
                    strokeWidth={isSelected ? 1.2 : 0.35}
                    onMouseEnter={() => {
                      if (country) {
                        setHoveredCountryCode(country.iso3)
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredCountryCode(null)
                    }}
                    onClick={() => {
                      if (country) {
                        onCountrySelect(country.iso3)
                      }
                    }}
                    style={{
                      outline: 'none',
                      cursor: country ? 'pointer' : 'default',
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>

        {hoveredCountry ? (
          <div className="absolute left-5 top-5 rounded-xl border border-emerald-200/20 bg-[#071714]/90 px-4 py-3 text-xs shadow-xl backdrop-blur-md">
            <p className="font-semibold text-emerald-50">
              {hoveredCountry.name}
            </p>

            <p className="mt-1 text-emerald-200/70">
              {formatMetricValue(hoveredCountry, metric)}
            </p>
          </div>
        ) : null}

        <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4 text-[10px] uppercase tracking-[0.12em] text-emerald-100/55">
          <div className="flex items-center gap-3">
            <span>Lower</span>

            <span className="h-2 w-28 rounded-full bg-gradient-to-r from-[#4c916c] to-[#d4ffed]" />

            <span>Higher</span>
          </div>

          <span>Click a country to inspect it</span>
        </div>
      </div>
    </div>
  )
}