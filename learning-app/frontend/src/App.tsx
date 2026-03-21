import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AssessmentPage from './pages/AssessmentPage'
import PlanPage from './pages/PlanPage'
import ModulePage from './pages/ModulePage'
import GardenPage from './pages/GardenPage'
import AppShell from './components/layout/AppShell'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/assessment/:sessionId" element={<AssessmentPage />} />
      <Route element={<AppShell />}>
        <Route path="/plan/:planId" element={<PlanPage />} />
        <Route path="/plan/:planId/module/:moduleId" element={<ModulePage />} />
        <Route path="/garden/:planId" element={<GardenPage />} />
      </Route>
    </Routes>
  )
}

export default App
