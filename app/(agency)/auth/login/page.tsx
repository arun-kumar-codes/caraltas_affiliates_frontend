"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password")
  const [isLoading, setIsLoading] = useState(false)
  const [isRequestingOtp, setIsRequestingOtp] = useState(false)
  const [error, setError] = useState("")

  const handleRequestOtp = async () => {
    if (!phone) {
      setError("Please enter your phone number")
      return
    }
    setIsRequestingOtp(true)
    setError("")
    try {
      await authAPI.requestLoginOtp({ phone })
      setError("")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP")
    } finally {
      setIsRequestingOtp(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    try {
      const loginData = loginMethod === "password" 
        ? { phone, password }
        : { phone, otp }
      
      const response = await authAPI.login(loginData)
      
      if (response.accessToken) {
        if (response.agency.onboardingStatus === 'COMPLETED' && response.agency.approvalStatus === 'APPROVED') {
          router.push("/agency/dashboard")
        } else if (response.agency.onboardingStatus !== 'COMPLETED') {
          router.push("/agency/onboarding")
        } else {
          router.push("/agency/pending-approval")
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Login failed. Please check your credentials."
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border border-border shadow-xl p-8 w-full">
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your agency account</p>
          </div>

          <div className="mb-6 flex gap-2">
            <button
              type="button"
              onClick={() => setLoginMethod("password")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                loginMethod === "password"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("otp")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                loginMethod === "otp"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              OTP
            </button>
          </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 text-foreground bg-background transition-all"
              placeholder="+1234567890"
            />
          </div>

          {loginMethod === "password" ? (
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 text-foreground bg-background transition-all"
                placeholder="Enter your password"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-foreground mb-2">
                OTP
              </label>
              <div className="flex gap-2">
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 text-foreground bg-background transition-all"
                  placeholder="Enter OTP"
                />
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isRequestingOtp}
                  className="px-4 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isRequestingOtp ? "Sending..." : "Send OTP"}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-semibold text-primary hover:opacity-80 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold text-primary hover:opacity-80 transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}
