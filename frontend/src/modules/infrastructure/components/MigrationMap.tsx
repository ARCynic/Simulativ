import { useMemo, useState } from 'react'
import { geoCentroid } from 'd3-geo'
import type { GeoJsonObject } from 'geojson'
import {
  ComposableMap,
  Geography,
  Geographies,
  Graticule,
  Line,
  Marker,
  useGeographies,
} from 'react-simple-maps'
import worldMap from 'world-atlas/countries-110m.json'

import type {
  MigrationCountry,
  MigrationDirection,
  MigrationFlow,
  MigrationMetric,
} from '../data/migration/frontend_migrationData'

type MigrationMapProps = {
  countries: MigrationCountry[]
  flows: MigrationFlow[]
  metric: MigrationMetric
  direction: MigrationDirection
  selectedCountryCode: string
  onCountrySelect: (countryCode: string) => void
}

const geography = worldMap as unknown as GeoJsonObject

function metricValue(
  country: MigrationCountry,
  metric: MigrationMetric,
) {
  return metric === 'inboundStock'
    ? country.inboundMigrantStock
    : country.migrantSharePercent ?? 0
}

function formatMetricValue(
  country: MigrationCountry,
  metric: MigrationMetric,
) {
  if (metric === 'share') {
    return `${(country.migrantSharePercent ?? 0).toFixed(2)}% population share`
  }

  return `${(country.inboundMigrantStock / 1_000_000).toFixed(2)}M inbound stock`
}

function countryFill(
  country: MigrationCountry | undefined,
  metric: MigrationMetric,
  maximum: number,
) {
  if (!country) {
    return '#0a1411' // Deep void space for missing data
  }

  const intensity = Math.min(1, Math.max(0, metricValue(country, metric) / maximum))
  
  // Non-linear scaling (square root) ensures lower values remain visible 
  // on heavily skewed datasets like migration.
  const adjusted = Math.sqrt(intensity)

  // Gradient: Deep Forest (#0f241a) to Bright Mint (#42f5aa)
  const red = Math.round(15 + adjusted * 51)
  const green = Math.round(36 + adjusted * 209)
  const blue = Math.round(26 + adjusted * 144)

  return `rgb(${red}, ${green}, ${blue})`
}

function FlowOverlay({
  countries,
  flows,
  direction,
  selectedCountryCode,
}: Pick<
  MigrationMapProps,
  'countries' | 'flows' | 'direction' | 'selectedCountryCode'
>) {
  const { geographies } = useGeographies({ geography })

  const centroids = useMemo(
    () =>
      new Map(
        geographies.map((geo) => [
          String(geo.id ?? '').padStart(3, '0'),
          geoCentroid(geo as never) as [number, number],
        ]),
      ),
    [geographies],
  )

  const topFlows = useMemo(
    () =>
      flows
        .filter((flow) =>
          direction === 'inbound'
            ? flow.destinationIso3 === selectedCountryCode
            : flow.originIso3 === selectedCountryCode,
        )
        .sort((a, b) => b.migrantStock - a.migrantStock)
        .slice(0, 5),
    [direction, flows, selectedCountryCode],
  )

  function pointForCountry(iso3: string) {
    const country = countries.find((item) => item.iso3 === iso3)
    if (!country?.numericCode) return undefined
    return centroids.get(country.numericCode)
  }

  const selectedCountry = countries.find((country) => country.iso3 === selectedCountryCode)
  const selectedPoint = selectedCountry?.numericCode
    ? centroids.get(selectedCountry.numericCode)
    : undefined

  const strokeColor = direction === 'inbound' ? '#fbbf24' : '#6ee7b7' // Amber for inbound, Mint for outbound
  const glowColor = direction === 'inbound' ? 'rgba(251,191,36,0.6)' : 'rgba(110,231,183,0.6)'

  return (
    <>
      {topFlows.map((flow, index) => {
        const originPoint = pointForCountry(flow.originIso3)
        const destinationPoint = pointForCountry(flow.destinationIso3)

        if (!originPoint || !destinationPoint) return null

        return (
          <Line
            key={`${flow.originIso3}-${flow.destinationIso3}`}
            from={originPoint}
            to={destinationPoint}
            stroke={strokeColor}
            strokeWidth={Math.max(1, 3.5 - index * 0.45)}
            strokeOpacity={Math.max(0.4, 0.9 - index * 0.1)}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0px 0px 5px ${glowColor})` }}
            pointerEvents="none"
          />
        )
      })}

      {/* Animated Radar Ping for the Selected Country */}
      {selectedPoint ? (
        <Marker coordinates={selectedPoint} pointerEvents="none">
          <circle r={4} fill="none" stroke={strokeColor} strokeWidth={1}>
            <animate attributeName="r" from="4" to="24" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle
            r={4.5}
            fill="#050e0b"
            stroke={strokeColor}
            strokeWidth={1.5}
            style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
          />
        </Marker>
      ) : null}
    </>
  )
}

export function MigrationMap({
  countries,
  flows,
  metric,
  direction,
  selectedCountryCode,
  onCountrySelect,
}: MigrationMapProps) {
  const [hoveredCountryCode, setHoveredCountryCode] = useState<string | null>(null)

  const countriesByNumericCode = useMemo(
    () =>
      new Map(
        countries
          .filter((country) => country.numericCode)
          .map((country) => [country.numericCode as string, country]),
      ),
    [countries],
  )

  const maximum = Math.max(
    ...countries.map((country) => metricValue(country, metric)),
    1,
  )

  const hoveredCountry = countries.find((country) => country.iso3 === hoveredCountryCode)

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/5 bg-[#050e0b] shadow-[0_30px_100px_rgba(0,0,0,0.4)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.08),transparent_70%)]" />

      <div className="relative min-h-[420px] p-2 sm:min-h-[500px] sm:p-5">
        <ComposableMap
          aria-label="World map showing inbound and outbound migrant stock"
          projection="geoEqualEarth"
          projectionConfig={{
            center: [0, 8],
            scale: 165, // Slightly zoomed in
          }}
          width={980}
          height={500}
          className="h-auto w-full outline-none"
        >
          <Graticule
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth={0.5}
            strokeDasharray="4 4"
          />

          <Geographies geography={geography}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const numericCode = String(geo.id ?? '').padStart(3, '0')
                const country = countriesByNumericCode.get(numericCode)
                const isSelected = country?.iso3 === selectedCountryCode
                const isHovered = country?.iso3 === hoveredCountryCode

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={
                      isHovered
                        ? '#6ee7b7' // Vivid Emerald-300
                        : countryFill(country, metric, maximum)
                    }
                    stroke={
                      isSelected
                        ? '#ffffff'
                        : 'rgba(255, 255, 255, 0.08)'
                    }
                    strokeWidth={isSelected ? 1.5 : 0.25}
                    onMouseEnter={() => {
                      if (country) setHoveredCountryCode(country.iso3)
                    }}
                    onMouseLeave={() => setHoveredCountryCode(null)}
                    onClick={() => {
                      if (country) onCountrySelect(country.iso3)
                    }}
                    // Replaced inline style object with Tailwind for crisp transitions and TS compatibility
                    className="outline-none transition-all duration-300 ease-out hover:cursor-pointer hover:duration-100 active:outline-none"
                  />
                )
              })
            }
          </Geographies>

          <FlowOverlay
            countries={countries}
            flows={flows}
            direction={direction}
            selectedCountryCode={selectedCountryCode}
          />
        </ComposableMap>

        {/* HUD Data Readout */}
        {hoveredCountry ? (
          <div className="pointer-events-none absolute left-6 top-6 flex flex-col gap-1 rounded-xl border border-white/10 bg-[#050e0b]/90 px-5 py-4 shadow-[0_15px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">
              Region Data
            </p>
            <p className="truncate text-lg font-medium text-white shadow-black drop-shadow-sm">
              {hoveredCountry.name}
            </p>
            <p className="font-mono text-sm text-emerald-100/70">
              {formatMetricValue(hoveredCountry, metric)}
            </p>
          </div>
        ) : null}

        {/* Legend */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4 text-[10px] font-medium uppercase tracking-widest text-white/50">
          <div className="flex items-center gap-3 rounded-full border border-white/5 bg-white/5 px-4 py-2 backdrop-blur-sm">
            <span>Lower</span>
            {/* Matches the new countryFill colors */}
            <span className="h-1.5 w-32 rounded-full bg-gradient-to-r from-[#0f241a] to-[#42f5aa] shadow-[0_0_10px_rgba(66,245,170,0.15)]" />
            <span>Higher</span>
          </div>

          <span className="rounded-full border border-white/5 bg-white/5 px-4 py-2 backdrop-blur-sm">
            {direction === 'inbound' ? 'Inbound lines' : 'Outbound lines'} · Top 5
          </span>
        </div>
      </div>
    </div>
  )
}