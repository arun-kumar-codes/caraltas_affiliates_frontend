"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/auth/login")
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="grid grid-cols-2 grid-rows-3 gap-1 w-6 h-9">
            <div className="bg-primary rounded-sm"></div>
            <div className="bg-transparent"></div>
            <div className="bg-primary rounded-sm"></div>
            <div className="bg-primary rounded-sm"></div>
            <div className="bg-transparent"></div>
            <div className="bg-primary rounded-sm"></div>
          </div>
          <span className="text-gray-900 font-bold text-xl">CarAtlas</span>
        </div>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  )
}
