"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { authAPI } from "@/lib/api"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone") || ""
  
  const [formData, setFormData] = useState({
    otp: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isReset, setIsReset] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (formData.otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP")
      return
    }

    if (!phone) {
      setError("Phone number is required")
      return
    }

    setIsLoading(true)
    
    try {
      await authAPI.resetPassword({
        phone,
        otp: formData.otp,
        password: formData.password,
      })

      setIsReset(true)
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Password reset failed. Please try again."
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  if (isReset) {
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Reset!</h1>
              <p className="text-gray-600">
                Your password has been successfully reset. Redirecting to login...
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">
              Enter the OTP sent to <span className="font-semibold">{phone}</span> and your new password
            </p>
          </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
              OTP (6 digits)
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={formData.otp}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 text-gray-900 bg-white transition-all text-center text-2xl font-bold tracking-widest"
              placeholder="000000"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 text-gray-900 bg-white transition-all"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 text-gray-900 bg-white transition-all"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
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
