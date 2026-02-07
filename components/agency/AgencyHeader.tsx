"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { authAPI } from "@/lib/api"
import { LogOut, Menu } from "lucide-react"

interface AgencyHeaderProps {
  showSidebar?: boolean
  onMenuClick?: () => void
}

export default function AgencyHeader({ showSidebar, onMenuClick }: AgencyHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    authAPI.logout()
    router.push("/auth/login")
  }

  const getLogoLink = () => {
    if (pathname?.startsWith("/auth")) return "/auth/login"
    if (pathname === "/agency/onboarding") return "/agency/onboarding"
    if (pathname === "/agency/pending-approval") return "/agency/pending-approval"
    return "/agency/dashboard"
  }

  return (
    <header className="z-[100] w-full flex-shrink-0 border-b border-primary/30 bg-primary shadow-sm">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 md:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {showSidebar && (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open menu"
              className="flex shrink-0 items-center justify-center rounded-lg p-2 text-white hover:bg-white/20 active:bg-white/30 md:hidden"
            >
              <Menu size={24} />
            </button>
          )}
          <Link href={getLogoLink()} className="flex min-w-0 shrink items-center">
            <span className="flex items-center justify-center rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-gray-200 sm:px-4 sm:py-2">
              <Image
                src="/logos/caratlas-full.png"
                alt="CarAtlas"
                width={140}
                height={40}
                className="h-6 w-auto sm:h-7"
                priority
              />
            </span>
          </Link>
        </div>

        <nav className="flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-white hover:bg-white/20 active:bg-white/30 sm:gap-2 sm:px-4 sm:py-2.5"
          >
            <LogOut size={18} />
            <span className="hidden text-sm font-semibold sm:inline">Log out</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
