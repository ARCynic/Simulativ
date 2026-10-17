export type Coordinates = [number, number]

export type MigrationPhase = 'observed' | 'projected'
export type MigrationMetric = 'stock' | 'inflow' | 'outflow' | 'net'

export interface MigrationCountry {
  name: string
  code: string
  coordinates: Coordinates
  stockMillions: number
  inflowMillions: number
  outflowMillions: number
  netMillions: number
  phase: MigrationPhase
}

export interface MigrationFlow {
  origin: string
  destination: string
  originCoordinates: Coordinates
  destinationCoordinates: Coordinates
  valueMillions: number
  phase: MigrationPhase
}

export interface MigrationSnapshot {
  year: number
  phase: MigrationPhase
  countries: MigrationCountry[]
  flows: MigrationFlow[]
}

export const MIGRATION_START_YEAR = 2010
export const LAST_OBSERVED_YEAR = 2024
export const MIGRATION_END_YEAR = 2035

export const migrationDataNote =
  'Illustrative data model for the V1 interaction. Replace with processed country-level data.'

interface CountrySeed {
  name: string
  code: string
  coordinates: Coordinates
  stockMillions: number
  inflowMillions: number
  outflowMillions: number
  annualGrowth: number
}

interface FlowSeed {
  origin: string
  destination: string
  valueMillions: number
  annualGrowth: number
}

const countrySeeds: CountrySeed[] = [
  {
    name: 'Germany',
    code: 'DEU',
    coordinates: [10.45, 51.16],
    stockMillions: 13.1,
    inflowMillions: 0.72,
    outflowMillions: 0.42,
    annualGrowth: 0.018,
  },
  {
    name: 'United States of America',
    code: 'USA',
    coordinates: [-100, 38],
    stockMillions: 40.6,
    inflowMillions: 1.1,
    outflowMillions: 0.28,
    annualGrowth: 0.022,
  },
  {
    name: 'Canada',
    code: 'CAN',
    coordinates: [-106.3, 56.1],
    stockMillions: 7.2,
    inflowMillions: 0.42,
    outflowMillions: 0.12,
    annualGrowth: 0.02,
  },
  {
    name: 'United Kingdom',
    code: 'GBR',
    coordinates: [-3.4, 55.4],
    stockMillions: 8.1,
    inflowMillions: 0.56,
    outflowMillions: 0.21,
    annualGrowth: 0.02,
  },
  {
    name: 'Australia',
    code: 'AUS',
    coordinates: [133.8, -25.3],
    stockMillions: 7.0,
    inflowMillions: 0.36,
    outflowMillions: 0.1,
    annualGrowth: 0.019,
  },
  {
    name: 'United Arab Emirates',
    code: 'ARE',
    coordinates: [54.3, 24.3],
    stockMillions: 7.8,
    inflowMillions: 0.82,
    outflowMillions: 0.16,
    annualGrowth: 0.025,
  },
  {
    name: 'Saudi Arabia',
    code: 'SAU',
    coordinates: [45.1, 23.9],
    stockMillions: 9.1,
    inflowMillions: 0.62,
    outflowMillions: 0.22,
    annualGrowth: 0.018,
  },
  {
    name: 'India',
    code: 'IND',
    coordinates: [78.9, 20.6],
    stockMillions: 5.4,
    inflowMillions: 0.24,
    outflowMillions: 1.18,
    annualGrowth: 0.016,
  },
  {
    name: 'Bangladesh',
    code: 'BGD',
    coordinates: [90.4, 23.7],
    stockMillions: 2.4,
    inflowMillions: 0.12,
    outflowMillions: 0.74,
    annualGrowth: 0.021,
  },
  {
    name: 'Pakistan',
    code: 'PAK',
    coordinates: [69.3, 30.4],
    stockMillions: 3.5,
    inflowMillions: 0.2,
    outflowMillions: 0.67,
    annualGrowth: 0.018,
  },
  {
    name: 'Turkey',
    code: 'TUR',
    coordinates: [35.2, 38.9],
    stockMillions: 5.1,
    inflowMillions: 0.46,
    outflowMillions: 0.52,
    annualGrowth: 0.014,
  },
  {
    name: 'France',
    code: 'FRA',
    coordinates: [2.2, 46.2],
    stockMillions: 7.9,
    inflowMillions: 0.42,
    outflowMillions: 0.18,
    annualGrowth: 0.015,
  },
  {
    name: 'Spain',
    code: 'ESP',
    coordinates: [-3.7, 40.4],
    stockMillions: 6.3,
    inflowMillions: 0.44,
    outflowMillions: 0.17,
    annualGrowth: 0.016,
  },
  {
    name: 'Italy',
    code: 'ITA',
    coordinates: [12.6, 41.9],
    stockMillions: 5.2,
    inflowMillions: 0.31,
    outflowMillions: 0.27,
    annualGrowth: 0.012,
  },
  {
    name: 'Russia',
    code: 'RUS',
    coordinates: [100.6, 61.5],
    stockMillions: 10.6,
    inflowMillions: 0.34,
    outflowMillions: 0.42,
    annualGrowth: 0.009,
  },
  {
    name: 'Ukraine',
    code: 'UKR',
    coordinates: [31.2, 48.4],
    stockMillions: 5.0,
    inflowMillions: 0.26,
    outflowMillions: 0.55,
    annualGrowth: 0.015,
  },
  {
    name: 'China',
    code: 'CHN',
    coordinates: [104.2, 35.9],
    stockMillions: 1.1,
    inflowMillions: 0.16,
    outflowMillions: 0.82,
    annualGrowth: 0.014,
  },
  {
    name: 'Japan',
    code: 'JPN',
    coordinates: [138.2, 36.2],
    stockMillions: 2.5,
    inflowMillions: 0.28,
    outflowMillions: 0.08,
    annualGrowth: 0.019,
  },
  {
    name: 'Brazil',
    code: 'BRA',
    coordinates: [-51.9, -14.2],
    stockMillions: 1.1,
    inflowMillions: 0.14,
    outflowMillions: 0.19,
    annualGrowth: 0.011,
  },
  {
    name: 'Mexico',
    code: 'MEX',
    coordinates: [-102.5, 23.6],
    stockMillions: 11.2,
    inflowMillions: 0.22,
    outflowMillions: 0.7,
    annualGrowth: 0.015,
  },
  {
    name: 'Nigeria',
    code: 'NGA',
    coordinates: [8.7, 9.1],
    stockMillions: 1.3,
    inflowMillions: 0.18,
    outflowMillions: 0.39,
    annualGrowth: 0.024,
  },
  {
    name: 'Morocco',
    code: 'MAR',
    coordinates: [-7.1, 31.8],
    stockMillions: 3.1,
    inflowMillions: 0.16,
    outflowMillions: 0.43,
    annualGrowth: 0.017,
  },
]

const flowSeeds: FlowSeed[] = [
  { origin: 'Mexico', destination: 'United States of America', valueMillions: 4.8, annualGrowth: 0.012 },
  { origin: 'India', destination: 'United Arab Emirates', valueMillions: 2.1, annualGrowth: 0.021 },
  { origin: 'India', destination: 'United States of America', valueMillions: 1.8, annualGrowth: 0.019 },
  { origin: 'Bangladesh', destination: 'United Arab Emirates', valueMillions: 1.1, annualGrowth: 0.022 },
  { origin: 'Pakistan', destination: 'United Arab Emirates', valueMillions: 0.92, annualGrowth: 0.018 },
  { origin: 'Turkey', destination: 'Germany', valueMillions: 0.83, annualGrowth: 0.01 },
  { origin: 'Ukraine', destination: 'Germany', valueMillions: 0.75, annualGrowth: 0.03 },
  { origin: 'Ukraine', destination: 'Poland', valueMillions: 0.92, annualGrowth: 0.03 },
  { origin: 'Morocco', destination: 'France', valueMillions: 0.88, annualGrowth: 0.014 },
  { origin: 'Nigeria', destination: 'United Kingdom', valueMillions: 0.61, annualGrowth: 0.019 },
  { origin: 'China', destination: 'United States of America', valueMillions: 1.22, annualGrowth: 0.012 },
  { origin: 'Philippines', destination: 'United States of America', valueMillions: 0.86, annualGrowth: 0.016 },
  { origin: 'Romania', destination: 'Germany', valueMillions: 0.69, annualGrowth: 0.011 },
  { origin: 'Syria', destination: 'Turkey', valueMillions: 1.42, annualGrowth: 0.008 },
]

const additionalCoordinates: Record<string, Coordinates> = {
  Poland: [19.1, 51.9],
  Philippines: [121.8, 12.9],
  Romania: [24.9, 45.9],
  Syria: [38.9, 34.8],
}

function getCoordinates(countryName: string): Coordinates {
  return (
    countrySeeds.find((country) => country.name === countryName)?.coordinates ??
    additionalCoordinates[countryName] ??
    [0, 0]
  )
}

function getGrowthMultiplier(year: number, annualGrowth: number): number {
  const observedYears = Math.min(year, LAST_OBSERVED_YEAR) - MIGRATION_START_YEAR
  const projectedYears = Math.max(0, year - LAST_OBSERVED_YEAR)
  const observedMultiplier = 1 + observedYears * annualGrowth
  const projectedMultiplier = Math.pow(1 + annualGrowth * 1.25, projectedYears)

  return observedMultiplier * projectedMultiplier
}

export function getMigrationSnapshot(year: number): MigrationSnapshot {
  const phase: MigrationPhase = year <= LAST_OBSERVED_YEAR ? 'observed' : 'projected'

  const countries = countrySeeds.map((seed) => {
    const multiplier = getGrowthMultiplier(year, seed.annualGrowth)
    const inflowMillions = seed.inflowMillions * multiplier
    const outflowMillions = seed.outflowMillions * multiplier

    return {
      name: seed.name,
      code: seed.code,
      coordinates: seed.coordinates,
      stockMillions: seed.stockMillions * multiplier,
      inflowMillions,
      outflowMillions,
      netMillions: inflowMillions - outflowMillions,
      phase,
    }
  })

  const flows = flowSeeds.map((seed) => ({
    origin: seed.origin,
    destination: seed.destination,
    originCoordinates: getCoordinates(seed.origin),
    destinationCoordinates: getCoordinates(seed.destination),
    valueMillions: seed.valueMillions * getGrowthMultiplier(year, seed.annualGrowth),
    phase,
  }))

  return { year, phase, countries, flows }
}
