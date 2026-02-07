"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    try {
      await authAPI.forgotPassword({ phone })
      setIsSubmitted(true)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to send OTP. Please try again."
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Phone</h1>
              <p className="text-gray-600">
                We've sent a password reset OTP to <span className="font-semibold">{phone}</span>
              </p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Please check your phone for the 6-digit OTP to reset your password.
            </p>
            <button
              onClick={() => router.push(`/auth/reset-password?phone=${encodeURIComponent(phone)}`)}
              className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Enter OTP
            </button>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
            <p className="text-gray-600">Enter your phone number to receive an OTP</p>
          </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 text-gray-900 bg-white transition-all"
              placeholder="+1234567890"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-primary hover:opacity-80 transition-colors"
          >
            Back to Login
          </Link>
        </div>
        </div>
      </div>
    </div>
  )
}
