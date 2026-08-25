import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

export default function Layout() {
  return (
    <div className="app-canvas-bg min-h-screen p-3 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1440px] overflow-hidden rounded-3xl bg-white shadow-xl shadow-indigo-200/40 sm:min-h-[calc(100vh-48px)]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col bg-lavender-50">
          <MobileNav />
          <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
            <div className="mx-auto max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
