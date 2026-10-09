export const runtimeConfig = {
  environment: import.meta.env.VITE_APP_ENV || import.meta.env.MODE,
  dataBaseUrl: import.meta.env.VITE_DATA_BASE_URL || '',
} as const