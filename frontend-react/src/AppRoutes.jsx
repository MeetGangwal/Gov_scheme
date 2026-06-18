import { Routes, Route } from 'react-router-dom'
import RootLayout from './components/layout/RootLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'
import EligibilityForm from './pages/EligibilityForm.jsx'
import MatchedSchemes from './pages/MatchedSchemes.jsx'
import SchemeBrowser from './pages/SchemeBrowser.jsx'
import SchemeDetail from './pages/SchemeDetail.jsx'
import SmartSearch from './pages/SmartSearch.jsx'
import NotFound from './pages/NotFound.jsx'

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<RootLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/check" element={<EligibilityForm />} />
                <Route path="/results" element={<MatchedSchemes />} />
                <Route path="/schemes" element={<SchemeBrowser />} />
                <Route path="/schemes/:id" element={<SchemeDetail />} />
                <Route path="/search" element={<SmartSearch />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
}