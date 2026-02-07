"use client"

import { ReactNode, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import AgencyHeader from "@/components/agency/AgencyHeader"
import AgencySidebar from "@/components/agency/AgencySidebar"
import OnboardingGuard from "@/components/agency/OnboardingGuard"
import { authAPI } from "@/lib/api"

export default function AgencyLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hideShell =
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/agency/onboarding") ||
    pathname === "/agency/pending-approval"
  const [showSidebar, setShowSidebar] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (hideShell) {
      setShowSidebar(false)
      setMobileOpen(false)
      return
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) {
      setShowSidebar(false)
      return
    }
    authAPI
      .getOnboardingStatus()
      .then((s) => setShowSidebar(s.approvalStatus === "APPROVED"))
      .catch(() => setShowSidebar(false))
  }, [pathname, hideShell])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  if (hideShell) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <header className="flex-shrink-0">
        <AgencyHeader showSidebar={showSidebar} onMenuClick={() => setMobileOpen(true)} />
      </header>
      <OnboardingGuard>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {showSidebar && (
            <>
              <div
                role="button"
                tabIndex={0}
                aria-label="Close menu"
                className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${
                  mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                onClick={() => setMobileOpen(false)}
                onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
              />
              <AgencySidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            </>
          )}
          <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">{children}</main>
        </div>
      </OnboardingGuard>
    </div>
  )
}
