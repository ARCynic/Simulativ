import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './layouts/AppShell'
import { AboutPage } from './pages/AboutPage'
import { DatasetsPage } from './pages/DatasetsPage'
import { HomePage } from './pages/Homepage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OceanPage } from './pages/OceanPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/ocean" element={<OceanPage />} />
          <Route path="/datasets" element={<DatasetsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App