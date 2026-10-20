import processedData from '../processed/migrationData.json'

export type MigrationMetric = 'inboundStock' | 'share'
export type MigrationDirection = 'inbound' | 'outbound'

export type MigrationCountry = {
  iso3: string
  name: string
  numericCode: string | null
  population: number | null
  inboundMigrantStock: number
  outboundMigrantStock: number
  migrantSharePercent: number | null
}

export type MigrationFlow = {
  originIso3: string
  originName: string
  destinationIso3: string
  destinationName: string
  migrantStock: number
}

export type MigrationSnapshot = {
  year: number
  countries: MigrationCountry[]
  flows: MigrationFlow[]
}

type ProcessedCountry = {
  code: string
  name: string
  numericCode: string | number | null
}

type ProcessedCountrySnapshot = {
  iso3: string
  country_name: string
  total_population: number | null
  migrant_stock_destination: number
  migrant_stock_origin_published_pairs: number
  migrant_share_percent: number | null
}

type ProcessedFlow = {
  origin_iso3: string
  origin_name: string
  destination_iso3: string
  destination_name: string
  migrant_stock: number
}

type ProcessedSnapshot = {
  year: number
  countries: ProcessedCountrySnapshot[]
  flows: ProcessedFlow[]
}

type ProcessedMigrationData = {
  schemaVersion: number
  referenceYears: number[]
  countries: ProcessedCountry[]
  snapshots: ProcessedSnapshot[]
  source: {
    migration: {
      provider: string
      dataset: string
    }
    population: {
      provider: string
      dataset: string
    }
  }
}

const data = processedData as unknown as ProcessedMigrationData

if (
  !Array.isArray(data.referenceYears) ||
  !Array.isArray(data.countries) ||
  !Array.isArray(data.snapshots) ||
  data.snapshots.length === 0
) {
  throw new Error(
    'Invalid migrationData.json. Regenerate and copy the processed file from the backend.',
  )
}

export const MIGRATION_YEARS = data.referenceYears
export const MIGRATION_START_YEAR = MIGRATION_YEARS[0]
export const MIGRATION_END_YEAR =
  MIGRATION_YEARS[MIGRATION_YEARS.length - 1]

export const DEFAULT_COUNTRY_CODE = 'DEU'

export const migrationDataNote =
  `${data.source.migration.dataset} · ${data.source.population.dataset}`

const countryMetadata = new Map(
  data.countries.map((country) => [country.code, country]),
)

function normalizeNumericCode(value: string | number | null) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value).padStart(3, '0')
}

function getClosestSnapshot(year: number) {
  return data.snapshots.reduce((closest, snapshot) => {
    const closestDistance = Math.abs(closest.year - year)
    const snapshotDistance = Math.abs(snapshot.year - year)

    return snapshotDistance < closestDistance ? snapshot : closest
  })
}

export function getMigrationSnapshot(year: number): MigrationSnapshot {
  const sourceSnapshot = getClosestSnapshot(year)

  return {
    year: sourceSnapshot.year,

    countries: sourceSnapshot.countries.map((country) => {
      const metadata = countryMetadata.get(country.iso3)

      return {
        iso3: country.iso3,
        name: country.country_name,
        numericCode: normalizeNumericCode(
          metadata?.numericCode ?? null,
        ),
        population: country.total_population,

        inboundMigrantStock:
          Number(country.migrant_stock_destination) || 0,

        outboundMigrantStock:
          Number(country.migrant_stock_origin_published_pairs) || 0,

        migrantSharePercent: country.migrant_share_percent,
      }
    }),

    flows: sourceSnapshot.flows.map((flow) => ({
      originIso3: flow.origin_iso3,
      originName: flow.origin_name,
      destinationIso3: flow.destination_iso3,
      destinationName: flow.destination_name,
      migrantStock: Number(flow.migrant_stock) || 0,
    })),
  }
}