"use client"

import { ReactNode, useEffect, useState, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"
import { Loader2 } from "lucide-react"

const ONBOARDING_PATH = "/agency/onboarding"
const PENDING_APPROVAL_PATH = "/agency/pending-approval"
const AUTH_PATH_PREFIX = "/auth"
const APPROVAL_POLL_INTERVAL_MS = 15000

export default function OnboardingGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

      if (!token) {
        if (!cancelled) {
          router.replace("/auth/login")
          setAllowed(false)
        }
        return
      }

      const isOnboardingPage = pathname === ONBOARDING_PATH
      const isAuthPage = pathname?.startsWith(AUTH_PATH_PREFIX)

      if (isAuthPage) {
        if (!cancelled) setAllowed(true)
        return
      }

      if (isOnboardingPage) {
        if (!cancelled) setAllowed(true)
        return
      }

      try {
        const status = await authAPI.getOnboardingStatus()
        if (cancelled) return
        
        if (status.onboardingStatus !== "COMPLETED") {
          router.replace(ONBOARDING_PATH)
          setAllowed(false)
          return
        }

        if (status.approvalStatus !== "APPROVED") {
          if (pathname === PENDING_APPROVAL_PATH) {
            setAllowed(true)
          } else {
            router.replace(PENDING_APPROVAL_PATH)
            setAllowed(false)
          }
          return
        }

        setAllowed(true)
      } catch {
        if (!cancelled) {
          router.replace("/auth/login")
          setAllowed(false)
        }
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [pathname, router])

  useEffect(() => {
    if (pathname !== PENDING_APPROVAL_PATH || allowed !== true) return

    const checkApproval = async () => {
      try {
        const status = await authAPI.getOnboardingStatus()
        if (status.approvalStatus === "APPROVED") {
          if (pollRef.current) {
            clearInterval(pollRef.current)
            pollRef.current = null
          }
          router.replace("/agency/dashboard")
        }
      } catch {
        // ignore
      }
    }

    checkApproval()
    pollRef.current = setInterval(checkApproval, APPROVAL_POLL_INTERVAL_MS)

    const onFocus = () => {
      checkApproval()
    }
    window.addEventListener("focus", onFocus)

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
      window.removeEventListener("focus", onFocus)
    }
  }, [pathname, allowed, router])

  if (allowed === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    )
  }

  if (!allowed) {
    return null
  }

  return <>{children}</>
}
