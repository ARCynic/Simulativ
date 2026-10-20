import { useMemo, useState } from 'react'
import { geoCentroid } from 'd3-geo'
import type { GeoJsonObject } from 'geojson'
import {
  ComposableMap,
  Geography,
  Graticule,
  Line,
  Marker,
  useGeographies,
} from 'react-simple-maps'
import worldMap from 'world-atlas/countries-110m.json'

import type {
  MigrationCountry,
  MigrationFlow,
  MigrationMetric,
} from '../data/migration/frontend_migrationData'

type MigrationMapProps = {
  countries: MigrationCountry[]
  flows: MigrationFlow[]
  metric: MigrationMetric
  selectedCountryCode: string
  onCountrySelect: (countryCode: string) => void
}

type MigrationMapLayersProps = Omit<
  MigrationMapProps,
  'flows'
> & {
  topFlows: MigrationFlow[]
  maximum: number
}

const geography = worldMap as unknown as GeoJsonObject

function metricValue(
  country: MigrationCountry,
  metric: MigrationMetric,
) {
  return metric === 'inboundStock'
    ? country.inboundMigrantStockMillions
    : country.migrantSharePercent ?? 0
}

function formatMetricValue(
  country: MigrationCountry,
  metric: MigrationMetric,
) {
  if (metric === 'share') {
    return `${(
      country.migrantSharePercent ?? 0
    ).toFixed(2)}%`
  }

  if (country.inboundMigrantStock >= 1_000_000) {
    return `${country.inboundMigrantStockMillions.toFixed(
      country.inboundMigrantStockMillions >= 10
        ? 1
        : 2,
    )}M`
  }

  return `${country.inboundMigrantStock.toLocaleString(
    'en',
  )} people`
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

function MigrationMapLayers({
  countries,
  metric,
  selectedCountryCode,
  onCountrySelect,
  topFlows,
  maximum,
}: MigrationMapLayersProps) {
  const [hoveredCountryCode, setHoveredCountryCode] =
    useState<string | null>(null)

  const { geographies } = useGeographies({
    geography,
  })

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

  const countriesByIso3 = useMemo(
    () =>
      new Map(
        countries.map((country) => [
          country.iso3,
          country,
        ]),
      ),
    [countries],
  )

  const centroidsByNumericCode = useMemo(
    () =>
      new Map(
        geographies.map((geo) => [
          String(geo.id ?? '').padStart(3, '0'),
          geoCentroid(geo) as [number, number],
        ]),
      ),
    [geographies],
  )

  const connections = topFlows
    .map((flow) => {
      const origin = countriesByIso3.get(flow.originIso3)
      const destination = countriesByIso3.get(
        flow.destinationIso3,
      )

      const from = origin?.numericCode
        ? centroidsByNumericCode.get(origin.numericCode)
        : undefined

      const to = destination?.numericCode
        ? centroidsByNumericCode.get(
            destination.numericCode,
          )
        : undefined

      if (!from || !to) {
        return null
      }

      return {
        flow,
        from,
        to,
      }
    })
    .filter(
      (
        connection,
      ): connection is {
        flow: MigrationFlow
        from: [number, number]
        to: [number, number]
      } => connection !== null,
    )

  const hoveredCountry = countries.find(
    (country) =>
      country.iso3 === hoveredCountryCode,
  )

  return (
    <>
      <Graticule
        stroke="rgba(120, 214, 171, 0.16)"
        strokeWidth={0.45}
      />

      {geographies.map((geo) => {
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
              cursor: country
                ? 'pointer'
                : 'default',
            }}
          />
        )
      })}

      {connections.map(({ flow, from, to }, index) => (
        <Line
          key={`${flow.originIso3}-${flow.destinationIso3}`}
          from={from}
          to={to}
          stroke={
            index === 0
              ? '#f0fff7'
              : '#9be8ba'
          }
          strokeWidth={Math.max(
            1,
            3.5 - index * 0.45,
          )}
          strokeOpacity={Math.max(
            0.42,
            0.95 - index * 0.1,
          )}
          strokeLinecap="round"
          fill="none"
          pointerEvents="none"
        />
      ))}

      {connections.map(({ flow, to }) => (
        <Marker
          key={`destination-${flow.originIso3}-${flow.destinationIso3}`}
          coordinates={to}
          pointerEvents="none"
        >
          <circle
            r={3}
            fill="#e1fff0"
            stroke="#2c8b61"
            strokeWidth={1}
          />
        </Marker>
      ))}

      {connections[0] ? (
        <Marker
          coordinates={connections[0].from}
          pointerEvents="none"
        >
          <circle
            r={5}
            fill="#06110f"
            stroke="#f0fff7"
            strokeWidth={2}
          />
        </Marker>
      ) : null}

      {hoveredCountry ? (
        <foreignObject
          x={24}
          y={24}
          width={190}
          height={72}
          pointerEvents="none"
        >
          <div className="rounded-xl border border-emerald-200/20 bg-[#071714]/90 px-4 py-3 text-xs shadow-xl backdrop-blur-md">
            <p className="font-semibold text-emerald-50">
              {hoveredCountry.name}
            </p>

            <p className="mt-1 text-emerald-200/70">
              {formatMetricValue(
                hoveredCountry,
                metric,
              )}
            </p>
          </div>
        </foreignObject>
      ) : null}
    </>
  )
}

export function MigrationMap({
  countries,
  flows,
  metric,
  selectedCountryCode,
  onCountrySelect,
}: MigrationMapProps) {
  const topFlows = useMemo(
    () =>
      flows
        .filter(
          (flow) =>
            flow.originIso3 ===
              selectedCountryCode &&
            flow.destinationIso3 !==
              selectedCountryCode,
        )
        .sort(
          (a, b) =>
            b.migrantStock - a.migrantStock,
        )
        .slice(0, 5),
    [flows, selectedCountryCode],
  )

  const maximum = Math.max(
    ...countries.map((country) =>
      metricValue(country, metric),
    ),
    1,
  )

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-emerald-300/15 bg-[#071714] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(72,190,137,0.16),transparent_55%)]" />

      <div className="relative min-h-[420px] p-2 sm:min-h-[500px] sm:p-5">
        <ComposableMap
          aria-label="World map showing migration flows"
          projection="geoEqualEarth"
          projectionConfig={{
            center: [0, 8],
            scale: 155,
          }}
          width={980}
          height={500}
          className="h-auto w-full"
        >
          <MigrationMapLayers
            countries={countries}
            metric={metric}
            selectedCountryCode={selectedCountryCode}
            onCountrySelect={onCountrySelect}
            topFlows={topFlows}
            maximum={maximum}
          />
        </ComposableMap>

        <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4 text-[10px] uppercase tracking-[0.12em] text-emerald-100/55">
          <div className="flex items-center gap-3">
            <span>Lower</span>

            <span className="h-2 w-28 rounded-full bg-gradient-to-r from-[#4c916c] to-[#d4ffed]" />

            <span>Higher</span>
          </div>

          <span>
            {topFlows.length > 0
              ? 'Lines show top five destinations'
              : 'No mapped destinations'}
          </span>
        </div>
      </div>
    </div>
  )
}