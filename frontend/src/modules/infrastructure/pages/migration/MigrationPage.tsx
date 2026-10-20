// import { useEffect, useMemo, useState } from 'react'
// import type { GeoJsonObject } from 'geojson'
// import {
//   ComposableMap,
//   Geography,
//   Geographies,
//   Graticule,
//   Line,
//   Marker,
// } from 'react-simple-maps'
// import worldMap from 'world-atlas/countries-110m.json'

// import { Panel } from '../../../../components/ui/Panel'
// import { SectionHeading } from '../../../../components/ui/SectionHeading'
// import { StatusBadge } from '../../../../components/ui/StatusBadge'

// import {
//   getMigrationSnapshot,
//   LAST_OBSERVED_YEAR,
//   MIGRATION_END_YEAR,
//   MIGRATION_START_YEAR,
//   migrationDataNote,
//   type MigrationCountry,
//   type MigrationMetric,
// } from '../../data/migration/migrationData'

// const worldGeography = worldMap as unknown as GeoJsonObject

// const metricLabels: Record<MigrationMetric, string> = {
//   stock: 'Migrant stock',
//   inflow: 'Annual inflow',
//   outflow: 'Annual outflow',
//   net: 'Net movement',
// }

// function getMetricValue(country: MigrationCountry, metric: MigrationMetric) {
//   switch (metric) {
//     case 'inflow':
//       return country.inflowMillions
//     case 'outflow':
//       return country.outflowMillions
//     case 'net':
//       return country.netMillions
//     case 'stock':
//     default:
//       return country.stockMillions
//   }
// }

// function formatMillions(value: number, signed = false) {
//   const sign = signed && value > 0 ? '+' : ''
//   const precision = Math.abs(value) >= 10 ? 1 : 2

//   return `${sign}${value.toFixed(precision)}M`
// }

// function getCountryFill(
//   country: MigrationCountry | undefined,
//   metric: MigrationMetric,
//   metricMaximum: number,
// ) {
//   if (!country) {
//     return 'rgba(25, 48, 55, 0.58)'
//   }

//   const value = getMetricValue(country, metric)
//   const intensity = Math.min(1, Math.abs(value) / Math.max(metricMaximum, 1))
//   const alpha = 0.22 + intensity * 0.64

//   if (metric === 'net' && value < 0) {
//     return `rgba(236, 143, 157, ${alpha})`
//   }

//   return `rgba(146, 231, 189, ${alpha})`
// }

// export function MigrationPage() {
//   const [year, setYear] = useState(LAST_OBSERVED_YEAR)
//   const [metric, setMetric] = useState<MigrationMetric>('stock')
//   const [selectedCountry, setSelectedCountry] = useState('Germany')
//   const [isPlaying, setIsPlaying] = useState(false)

//   const snapshot = useMemo(() => getMigrationSnapshot(year), [year])
//   const countryByName = useMemo(
//     () => new Map(snapshot.countries.map((country) => [country.name, country])),
//     [snapshot],
//   )

//   const selectedCountryName = countryByName.has(selectedCountry)
//     ? selectedCountry
//     : snapshot.countries[0]?.name ?? ''
//   const selected = countryByName.get(selectedCountryName)
//   const isTrendPlaying = isPlaying && year < MIGRATION_END_YEAR
//   const metricMaximum = Math.max(
//     ...snapshot.countries.map((country) =>
//       metric === 'net' ? Math.abs(getMetricValue(country, metric)) : getMetricValue(country, metric),
//     ),
//     1,
//   )

//   const visibleFlows = useMemo(() => {
//     const matchingFlows = snapshot.flows.filter(
//       (flow) => flow.origin === selectedCountryName || flow.destination === selectedCountryName,
//     )
//     const sourceFlows = matchingFlows.length > 0 ? matchingFlows : snapshot.flows

//     return [...sourceFlows].sort((left, right) => right.valueMillions - left.valueMillions).slice(0, 8)
//   }, [selectedCountryName, snapshot])

//   useEffect(() => {
//     if (!isTrendPlaying) {
//       return undefined
//     }

//     const timer = window.setTimeout(() => {
//       setYear((currentYear) => Math.min(MIGRATION_END_YEAR, currentYear + 1))
//     }, 850)

//     return () => window.clearTimeout(timer)
//   }, [isTrendPlaying, year])

//   const yearPercent =
//     ((year - MIGRATION_START_YEAR) / (MIGRATION_END_YEAR - MIGRATION_START_YEAR)) * 100
//   const observedPercent =
//     ((LAST_OBSERVED_YEAR - MIGRATION_START_YEAR) /
//       (MIGRATION_END_YEAR - MIGRATION_START_YEAR)) *
//     100

//   function handleReset() {
//     setIsPlaying(false)
//     setYear(LAST_OBSERVED_YEAR)
//     setMetric('stock')
//     setSelectedCountry('Germany')
//   }

//   return (
//     <div className="page migration-page">
//       <section className="page-hero shell migration-hero">
//         <div className="page-hero__topline">
//           <p className="eyebrow">INFRASTRUCTURE / 01</p>
//           <StatusBadge tone={snapshot.phase === 'observed' ? 'active' : 'planned'}>
//             {snapshot.phase === 'observed' ? 'Observed window' : 'Projected scenario'}
//           </StatusBadge>
//         </div>
//         <h1>Migration atlas.</h1>
//         <p className="page-hero__description">
//           Map movement between countries, then extend the observed pattern into a visible trend
//           scenario.
//         </p>
//       </section>

//       <section className="section shell migration-workspace">
//         <Panel className="migration-map-panel">
//           <div className="panel__header">
//             <div>
//               <p className="eyebrow">GLOBAL MOVEMENT / {snapshot.year}</p>
//               <h2>Country connections</h2>
//             </div>
//             <StatusBadge tone={snapshot.phase === 'observed' ? 'active' : 'planned'}>
//               {snapshot.phase === 'observed' ? 'Observed data' : 'Trend extension'}
//             </StatusBadge>
//           </div>

//           <div className="migration-map-shell">
//             <ComposableMap
//               aria-label="World map showing country migration values and directional flows"
//               className="migration-map"
//               projection="geoEqualEarth"
//               projectionConfig={{ center: [0, 8], scale: 155 }}
//               role="img"
//               viewBox="0 0 980 480"
//             >
//               <Graticule
//                 className="migration-map__graticule"
//                 stroke="rgba(156, 221, 169, 0.16)"
//                 strokeWidth={0.45}
//               />

//               <Geographies geography={worldGeography}>
//                 {({ geographies }) =>
//                   geographies.map((geography) => {
//                     const countryName = String(geography.properties?.name ?? '')
//                     const country = countryByName.get(countryName)

//                     return (
//                       <Geography
//                         key={geography.rsmKey}
//                         geography={geography}
//                         fill={getCountryFill(country, metric, metricMaximum)}
//                         stroke="rgba(205, 236, 221, 0.26)"
//                         strokeWidth={0.35}
//                         onClick={() => {
//                           if (country) {
//                             setSelectedCountry(country.name)
//                           }
//                         }}
//                         className={country ? 'migration-map__country migration-map__country--interactive' : 'migration-map__country'}
//                         style={{ outline: 'none' }}
//                       />
//                     )
//                   })
//                 }
//               </Geographies>

//               {visibleFlows.map((flow) => (
//                 <Line
//                   key={`${flow.origin}-${flow.destination}`}
//                   from={flow.originCoordinates}
//                   to={flow.destinationCoordinates}
//                   fill="none"
//                   opacity={selected ? 0.75 : 0.45}
//                   stroke="#b4f3c8"
//                   strokeDasharray={flow.phase === 'projected' ? '3 4' : undefined}
//                   strokeLinecap="round"
//                   strokeWidth={Math.max(0.8, Math.min(4, flow.valueMillions * 0.7))}
//                 />
//               ))}

//               {snapshot.countries.map((country) => (
//                 <Marker
//                   key={country.code}
//                   coordinates={country.coordinates}
//                   onClick={() => setSelectedCountry(country.name)}
//                 >
//                   <circle
//                     className="migration-map__marker"
//                     cx={0}
//                     cy={0}
//                     fill={country.name === selectedCountryName ? '#f5fff7' : '#9ce0b0'}
//                     r={country.name === selectedCountryName ? 5 : 2.5}
//                     stroke="#193b2b"
//                     strokeWidth={1}
//                   />
//                 </Marker>
//               ))}
//             </ComposableMap>

//             <div className="migration-map__legend" aria-label="Map legend">
//               <span>
//                 <i className="migration-map__legend-line" /> Movement flow
//               </span>
//               <span>
//                 <i className="migration-map__legend-dot" /> Country marker
//               </span>
//               <span>
//                 <i className="migration-map__legend-negative" /> Negative net
//               </span>
//             </div>
//           </div>

//           <p className="migration-map-panel__note">{migrationDataNote}</p>
//         </Panel>

//         <Panel className="migration-controls-panel">
//           <div className="panel__header">
//             <div>
//               <p className="eyebrow">CONTROL SURFACE</p>
//               <h2>Change the frame</h2>
//             </div>
//             <span className="status-panel__index">V1</span>
//           </div>

//           <div className="migration-control-group">
//             <label htmlFor="migration-metric">Map metric</label>
//             <select
//               id="migration-metric"
//               value={metric}
//               onChange={(event) => setMetric(event.target.value as MigrationMetric)}
//             >
//               {Object.entries(metricLabels).map(([value, label]) => (
//                 <option key={value} value={value}>
//                   {label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="migration-control-group">
//             <label htmlFor="migration-country">Focus country</label>
//             <select
//               id="migration-country"
//               value={selectedCountryName}
//               onChange={(event) => setSelectedCountry(event.target.value)}
//             >
//               {snapshot.countries.map((country) => (
//                 <option key={country.code} value={country.name}>
//                   {country.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="migration-control-group migration-year-control">
//             <div className="migration-control-label">
//               <label htmlFor="migration-year">Year</label>
//               <strong>{year}</strong>
//             </div>
//             <input
//               id="migration-year"
//               type="range"
//               min={MIGRATION_START_YEAR}
//               max={MIGRATION_END_YEAR}
//               step={1}
//               value={year}
//               onChange={(event) => {
//                 setIsPlaying(false)
//                 setYear(Number(event.target.value))
//               }}
//             />
//             <div className="migration-range-labels">
//               <span>{MIGRATION_START_YEAR}</span>
//               <span>{LAST_OBSERVED_YEAR} observed</span>
//               <span>{MIGRATION_END_YEAR} scenario</span>
//             </div>
//           </div>

//           <div className="migration-control-actions">
//             <button
//               className="button-link button-link--primary"
//               type="button"
//               onClick={() => {
//                 if (year >= MIGRATION_END_YEAR) {
//                   setYear(MIGRATION_START_YEAR)
//                   setIsPlaying(true)
//                   return
//                 }

//                 setIsPlaying((playing) => !playing)
//               }}
//             >
//               {isTrendPlaying ? 'Pause trend' : year >= MIGRATION_END_YEAR ? 'Replay trend' : 'Play trend'}
//             </button>
//             <button className="button-link button-link--secondary" type="button" onClick={handleReset}>
//               Reset
//             </button>
//           </div>

//           <div className="migration-phase-card">
//             <span className="eyebrow">CURRENT PHASE</span>
//             <strong>{snapshot.phase === 'observed' ? 'Observed history' : 'Projected trend'}</strong>
//             <p>
//               {snapshot.phase === 'observed'
//                 ? 'The map is inside the observed window.'
//                 : 'The map is extending the latest movement pattern forward.'}
//             </p>
//           </div>
//         </Panel>
//       </section>

//       <section className="section shell migration-details">
//         <SectionHeading
//           description="Select a country or move the timeline to inspect how the map changes. The projection boundary is deliberately visible instead of being folded into the historical record."
//           eyebrow="READ THE MAP"
//           title="A country is the starting point, not the endpoint."
//         />

//         <div className="migration-details-grid">
//           <Panel>
//             <div className="panel__header">
//               <div>
//                 <p className="eyebrow">SELECTED COUNTRY</p>
//                 <h2>{selected?.name ?? 'No country selected'}</h2>
//               </div>
//               <span className="status-panel__index">{selected?.code ?? '—'}</span>
//             </div>

//             <div className="migration-stat-grid">
//               <div>
//                 <span>Migrant stock</span>
//                 <strong>{selected ? formatMillions(selected.stockMillions) : '—'}</strong>
//               </div>
//               <div>
//                 <span>Annual inflow</span>
//                 <strong>{selected ? formatMillions(selected.inflowMillions) : '—'}</strong>
//               </div>
//               <div>
//                 <span>Annual outflow</span>
//                 <strong>{selected ? formatMillions(selected.outflowMillions) : '—'}</strong>
//               </div>
//               <div>
//                 <span>Net movement</span>
//                 <strong className={selected && selected.netMillions < 0 ? 'is-negative' : ''}>
//                   {selected ? formatMillions(selected.netMillions, true) : '—'}
//                 </strong>
//               </div>
//             </div>
//           </Panel>

//           <Panel>
//             <div className="panel__header">
//               <div>
//                 <p className="eyebrow">CONNECTED FLOWS</p>
//                 <h2>{selected?.name ?? 'Country'} routes</h2>
//               </div>
//               <span className="status-panel__index">{visibleFlows.length.toString().padStart(2, '0')}</span>
//             </div>

//             <div className="migration-flow-list">
//               {visibleFlows.map((flow) => (
//                 <div className="migration-flow-row" key={`${flow.origin}-${flow.destination}`}>
//                   <span>
//                     {flow.origin} <b>→</b> {flow.destination}
//                   </span>
//                   <strong>{formatMillions(flow.valueMillions)}</strong>
//                 </div>
//               ))}
//             </div>
//           </Panel>
//         </div>

//         <Panel className="migration-timeline-panel">
//           <div className="panel__header">
//             <div>
//               <p className="eyebrow">TIME MODEL</p>
//               <h2>Observed → projected</h2>
//             </div>
//             <StatusBadge tone={snapshot.phase === 'observed' ? 'active' : 'planned'}>
//               {snapshot.year}
//             </StatusBadge>
//           </div>

//           <div className="migration-timeline">
//             <div className="migration-timeline__rail">
//               <span className="migration-timeline__observed" style={{ width: `${observedPercent}%` }} />
//               <span
//                 className="migration-timeline__projection"
//                 style={{ left: `${observedPercent}%`, width: `${100 - observedPercent}%` }}
//               />
//               <span className="migration-timeline__current" style={{ left: `${yearPercent}%` }} />
//               <input
//                 aria-label="Migration timeline year"
//                 max={MIGRATION_END_YEAR}
//                 min={MIGRATION_START_YEAR}
//                 type="range"
//                 value={year}
//                 onChange={(event) => {
//                   setIsPlaying(false)
//                   setYear(Number(event.target.value))
//                 }}
//               />
//             </div>
//             <div className="migration-timeline__labels">
//               <span>{MIGRATION_START_YEAR}</span>
//               <span>{LAST_OBSERVED_YEAR} / observed boundary</span>
//               <span>{MIGRATION_END_YEAR} / projected</span>
//             </div>
//           </div>
//         </Panel>
//       </section>
//     </div>
//   )
// }
