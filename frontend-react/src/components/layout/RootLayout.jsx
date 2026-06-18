import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import TopNavbar from './TopNavbar.jsx'
import SiteFooter from './SiteFooter.jsx'

export default function RootLayout() {
    const { pathname } = useLocation()

    // Scroll to top on route change
    useEffect(() => { window.scrollTo(0, 0) }, [pathname])

    return (
        <div className="flex flex-col min-h-screen">
            <TopNavbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <SiteFooter />
        </div>
    )
}