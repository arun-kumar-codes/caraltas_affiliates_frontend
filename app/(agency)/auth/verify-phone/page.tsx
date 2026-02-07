"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { authAPI } from "@/lib/api"

export default function VerifyPhonePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone") || ""
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isVerified, setIsVerified] = useState(false)

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError("")

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData.split("").concat(Array(6 - pastedData.length).fill(""))
    setOtp(newOtp.slice(0, 6))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const otpString = otp.join("")
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP")
      return
    }

    if (!phone) {
      setError("Phone number is required")
      return
    }

    setIsLoading(true)

    try {
      const response = await authAPI.verifyPhone({
        phone,
        otp: otpString,
      })

      if (response.message) {
        setIsVerified(true)
        setTimeout(() => {
          router.push("/agency/onboarding")
        }, 2000)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Invalid OTP. Please try again."
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center w-full">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Phone Verified!</h1>
              <p className="text-gray-600">
                Your phone number has been successfully verified. Redirecting to onboarding...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/logos/caratlas-full.png"
                alt="CarAtlas"
                width={140}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Phone Number</h1>
            <p className="text-gray-600">
              Enter the 6-digit OTP sent to <br />
              <span className="font-semibold">{phone}</span>
            </p>
          </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join("").length !== 6}
            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>
        </form>
        </div>
      </div>
    </div>
  )
}
