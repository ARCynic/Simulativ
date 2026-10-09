export type DomainAccent =
  | 'cyan'
  | 'blue'
  | 'amber'
  | 'violet'
  | 'green'

export type DomainStatus = 'foundation' | 'planned'

export interface NavItem {
  label: string
  to: string
}

export interface DomainDefinition {
  name: string
  description: string
  accent: DomainAccent
  status: DomainStatus
  to: string
}

export const siteConfig = {
  name: 'Simulativ',
  tagline: 'Ecosystems in motion',
  version: 'v0.1',
} as const

export const navItems: NavItem[] = [
  { label: 'Overview', to: '/' },
  { label: 'Ocean systems', to: '/ocean' },
  { label: 'Datasets', to: '/datasets' },
  { label: 'About', to: '/about' },
]

export const domains: DomainDefinition[] = [
  {
    name: 'Ocean systems',
    description:
      'Biodiversity, movement, fishing activity, and ocean conditions in one spatial frame.',
    accent: 'cyan',
    status: 'foundation',
    to: '/ocean',
  },
  {
    name: 'Energy',
    description:
      'Explore how production, demand, networks, and resources behave over time.',
    accent: 'amber',
    status: 'planned',
    to: '/about',
  },
  {
    name: 'Climate',
    description:
      'Make long-range environmental change easier to compare and interpret.',
    accent: 'blue',
    status: 'planned',
    to: '/about',
  },
  {
    name: 'Wildlife',
    description:
      'Follow populations, habitats, migration, and the pressures acting on them.',
    accent: 'green',
    status: 'planned',
    to: '/about',
  },
  {
    name: 'Infrastructure',
    description:
      'View the built systems that connect places, resources, and human activity.',
    accent: 'violet',
    status: 'planned',
    to: '/about',
  },
  {
    name: 'Research and knowledge',
    description:
      'Turn public evidence into transparent, inspectable paths of inquiry.',
    accent: 'cyan',
    status: 'planned',
    to: '/about',
  },
]