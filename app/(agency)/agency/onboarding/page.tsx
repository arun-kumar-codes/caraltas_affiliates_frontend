"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authAPI, OnboardingStatusResponse } from "@/lib/api"
import { Building2, Mail, MapPin, Banknote, Code, Loader2, CheckCircle, ChevronRight, ChevronLeft, X } from "lucide-react"

type StepData = {
  step1: {
    name: string
    businessType: string
    gstNumber: string
    panNumber: string
    registrationNumber: string
    yearOfEstablishment: string
  }
  step2: {
    contactPersonName: string
    contactPhone: string
    contactEmail: string
    whatsappNumber: string
    websiteUrl: string
  }
  step3: {
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    pincode: string
    country: string
    serviceAreas: string
  }
  step4: {
    bankName: string
    accountNumber: string
    ifscCode: string
    accountHolderName: string
  }
  step5: {
    apiUrl: string
    apiKey: string
  }
}

const initialData: StepData = {
  step1: {
    name: "",
    businessType: "",
    gstNumber: "",
    panNumber: "",
    registrationNumber: "",
    yearOfEstablishment: "",
  },
  step2: {
    contactPersonName: "",
    contactPhone: "",
    contactEmail: "",
    whatsappNumber: "",
    websiteUrl: "",
  },
  step3: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    serviceAreas: "",
  },
  step4: {
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
  },
  step5: {
    apiUrl: "",
    apiKey: "",
  },
}

const steps = [
  { id: 1, title: "Business Details", icon: Building2 },
  { id: 2, title: "Contact Information", icon: Mail },
  { id: 3, title: "Address & Service Areas", icon: MapPin },
  { id: 4, title: "Bank Details", icon: Banknote },
  { id: 5, title: "API Integration", icon: Code },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<StepData>(initialData)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const status = await authAPI.getOnboardingStatus()
        if (status.onboardingStatus === "COMPLETED") {
          if (status.approvalStatus === "APPROVED") {
            router.replace("/agency/dashboard")
          } else {
            router.replace("/agency/pending-approval")
          }
          return
        }
        // Load existing data
        setFormData({
          step1: {
            name: status.name || "",
            businessType: status.businessType || "",
            gstNumber: status.gstNumber || "",
            panNumber: status.panNumber || "",
            registrationNumber: status.registrationNumber || "",
            yearOfEstablishment: status.yearOfEstablishment?.toString() || "",
          },
          step2: {
            contactPersonName: status.contactPersonName || "",
            contactPhone: status.contactPhone || "",
            contactEmail: status.contactEmail || "",
            whatsappNumber: status.whatsappNumber || "",
            websiteUrl: status.websiteUrl || "",
          },
          step3: {
            addressLine1: status.addressLine1 || "",
            addressLine2: status.addressLine2 || "",
            city: status.city || "",
            state: status.state || "",
            pincode: status.pincode || "",
            country: status.country || "India",
            serviceAreas: Array.isArray(status.serviceAreas) 
              ? status.serviceAreas.join(", ") 
              : status.serviceAreas || "",
          },
          step4: {
            bankName: status.bankName || "",
            accountNumber: status.accountNumber || "",
            ifscCode: status.ifscCode || "",
            accountHolderName: status.accountHolderName || "",
          },
          step5: {
            apiUrl: status.apiUrl || "",
            apiKey: status.apiKey || "",
          },
        })
      } catch {
        if (typeof window !== "undefined" && !localStorage.getItem("auth_token")) {
          router.replace("/auth/login")
          return
        }
      } finally {
        setCheckingStatus(false)
      }
    }
    loadData()
  }, [router])

  const handleChange = (step: keyof StepData, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: value,
      },
    }))
    setError(null)
  }

  const saveStep = async (step: number) => {
    setSaving(true)
    setError(null)
    try {
      switch (step) {
        case 1:
          await authAPI.updateOnboardingStep1({
            name: formData.step1.name.trim(),
            businessType: formData.step1.businessType.trim() || undefined,
            gstNumber: formData.step1.gstNumber.trim(),
            panNumber: formData.step1.panNumber.trim() || undefined,
            registrationNumber: formData.step1.registrationNumber.trim() || undefined,
            yearOfEstablishment: formData.step1.yearOfEstablishment 
              ? parseInt(formData.step1.yearOfEstablishment) 
              : undefined,
          })
          break
        case 2:
          await authAPI.updateOnboardingStep2({
            contactPersonName: formData.step2.contactPersonName.trim() || undefined,
            contactPhone: formData.step2.contactPhone.trim() || undefined,
            contactEmail: formData.step2.contactEmail.trim(),
            whatsappNumber: formData.step2.whatsappNumber.trim() || undefined,
            websiteUrl: formData.step2.websiteUrl.trim() || undefined,
          })
          break
        case 3:
          const serviceAreas = formData.step3.serviceAreas
            .split(",")
            .map((area) => area.trim())
            .filter((area) => area.length > 0)
          await authAPI.updateOnboardingStep3({
            addressLine1: formData.step3.addressLine1.trim() || undefined,
            addressLine2: formData.step3.addressLine2.trim() || undefined,
            city: formData.step3.city.trim() || undefined,
            state: formData.step3.state.trim() || undefined,
            pincode: formData.step3.pincode.trim() || undefined,
            country: formData.step3.country.trim() || undefined,
            serviceAreas: serviceAreas.length > 0 ? serviceAreas : undefined,
          })
          break
        case 4:
          await authAPI.updateOnboardingStep4({
            bankName: formData.step4.bankName.trim(),
            accountNumber: formData.step4.accountNumber.trim(),
            ifscCode: formData.step4.ifscCode.trim(),
            accountHolderName: formData.step4.accountHolderName.trim(),
          })
          break
        case 5:
          await authAPI.updateOnboardingStep5({
            apiUrl: formData.step5.apiUrl.trim() || undefined,
            apiKey: formData.step5.apiKey.trim() || undefined,
          })
          break
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to save step"
      setError(message)
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async () => {
    // Validate current step
    if (currentStep === 1) {
      if (!formData.step1.name.trim() || !formData.step1.gstNumber.trim()) {
        setError("Business name and GST number are required")
        return
      }
    } else if (currentStep === 2) {
      if (!formData.step2.contactEmail.trim()) {
        setError("Contact email is required")
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.step2.contactEmail.trim())) {
        setError("Please enter a valid email address")
        return
      }
    } else if (currentStep === 4) {
      if (!formData.step4.bankName.trim() || !formData.step4.accountNumber.trim() || 
          !formData.step4.ifscCode.trim() || !formData.step4.accountHolderName.trim()) {
        setError("All bank details are required")
        return
      }
    }

    try {
      await saveStep(currentStep)
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1)
      } else if (currentStep === 4) {
        setCurrentStep(5)
      }
    } catch {
    }
  }

  const handleSkipAndSubmit = async () => {
    if (!formData.step4.bankName.trim() || !formData.step4.accountNumber.trim() ||
        !formData.step4.ifscCode.trim() || !formData.step4.accountHolderName.trim()) {
      setError("All bank details are required")
      return
    }
    setLoading(true)
    setError(null)
    try {
      await authAPI.updateOnboardingStep4({
        bankName: formData.step4.bankName.trim(),
        accountNumber: formData.step4.accountNumber.trim(),
        ifscCode: formData.step4.ifscCode.trim(),
        accountHolderName: formData.step4.accountHolderName.trim(),
      })
      await authAPI.submitOnboarding()
      setSuccess(true)
      setTimeout(() => {
        router.push("/agency/pending-approval")
      }, 2000)
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to submit onboarding"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      // Save step 5 if not already saved
      if (currentStep === 5) {
        await saveStep(5)
      }
      await authAPI.submitOnboarding()
      setSuccess(true)
      setTimeout(() => {
        router.push("/agency/pending-approval")
      }, 2000)
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to submit onboarding"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={48} className="animate-spin text-primary" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-4">
        <div className="inline-flex w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Onboarding Submitted!</h1>
        <p className="text-gray-600 mb-6">Your agency profile is complete. Waiting for superadmin approval...</p>
        <Loader2 size={24} className="animate-spin text-primary mx-auto" />
      </div>
    )
  }

  const CurrentIcon = steps[currentStep - 1].icon
  const progress = (currentStep / steps.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-4xl w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : isActive
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isActive || isCompleted ? "text-primary" : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      isCompleted ? "bg-primary" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CurrentIcon className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep - 1].title}</h2>
            <p className="text-sm text-gray-500">Step {currentStep} of {steps.length}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Step 1: Business Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.step1.name}
                onChange={(e) => handleChange("step1", "name", e.target.value)}
                placeholder="e.g. ABC Motors"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Type
              </label>
              <select
                value={formData.step1.businessType}
                onChange={(e) => handleChange("step1", "businessType", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                <option value="">Select business type</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="Private Limited">Private Limited</option>
                <option value="LLP">LLP</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                GST Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.step1.gstNumber}
                onChange={(e) => handleChange("step1", "gstNumber", e.target.value)}
                placeholder="e.g. 27ABCDE1234F1Z5"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={formData.step1.panNumber}
                  onChange={(e) => handleChange("step1", "panNumber", e.target.value)}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={formData.step1.registrationNumber}
                  onChange={(e) => handleChange("step1", "registrationNumber", e.target.value)}
                  placeholder="Business registration number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Year of Establishment
              </label>
              <input
                type="number"
                value={formData.step1.yearOfEstablishment}
                onChange={(e) => handleChange("step1", "yearOfEstablishment", e.target.value)}
                placeholder="e.g. 2010"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
        )}

        {/* Step 2: Contact Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Person Name
              </label>
              <input
                type="text"
                value={formData.step2.contactPersonName}
                onChange={(e) => handleChange("step2", "contactPersonName", e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.step2.contactPhone}
                  onChange={(e) => handleChange("step2", "contactPhone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={formData.step2.whatsappNumber}
                  onChange={(e) => handleChange("step2", "whatsappNumber", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.step2.contactEmail}
                onChange={(e) => handleChange("step2", "contactEmail", e.target.value)}
                placeholder="contact@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={formData.step2.websiteUrl}
                onChange={(e) => handleChange("step2", "websiteUrl", e.target.value)}
                placeholder="https://www.example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
        )}

        {/* Step 3: Address & Service Areas */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address Line 1
              </label>
              <input
                type="text"
                value={formData.step3.addressLine1}
                onChange={(e) => handleChange("step3", "addressLine1", e.target.value)}
                placeholder="Street, building name"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.step3.addressLine2}
                onChange={(e) => handleChange("step3", "addressLine2", e.target.value)}
                placeholder="Area, landmark"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.step3.city}
                  onChange={(e) => handleChange("step3", "city", e.target.value)}
                  placeholder="Mumbai"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.step3.state}
                  onChange={(e) => handleChange("step3", "state", e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  value={formData.step3.pincode}
                  onChange={(e) => handleChange("step3", "pincode", e.target.value)}
                  placeholder="400001"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.step3.country}
                onChange={(e) => handleChange("step3", "country", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Service Areas
              </label>
              <input
                type="text"
                value={formData.step3.serviceAreas}
                onChange={(e) => handleChange("step3", "serviceAreas", e.target.value)}
                placeholder="Mumbai, Pune, Delhi (comma-separated)"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
              <p className="mt-1 text-xs text-gray-500">Enter cities or regions where you provide services, separated by commas</p>
            </div>
          </div>
        )}

        {/* Step 4: Bank Details */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.step4.bankName}
                onChange={(e) => handleChange("step4", "bankName", e.target.value)}
                placeholder="e.g. State Bank of India"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.step4.accountNumber}
                onChange={(e) => handleChange("step4", "accountNumber", e.target.value)}
                placeholder="Account number"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.step4.ifscCode}
                  onChange={(e) => handleChange("step4", "ifscCode", e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001234"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.step4.accountHolderName}
                  onChange={(e) => handleChange("step4", "accountHolderName", e.target.value)}
                  placeholder="Account holder name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: API Integration */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-primary">
                <strong>Optional:</strong> If you provide listings via API, enter your API details below. 
                Otherwise, you can add listings directly through the platform.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                API URL
              </label>
              <input
                type="url"
                value={formData.step5.apiUrl}
                onChange={(e) => handleChange("step5", "apiUrl", e.target.value)}
                placeholder="https://api.example.com/listings"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={formData.step5.apiKey}
                onChange={(e) => handleChange("step5", "apiKey", e.target.value)}
                placeholder="Your API key"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1 || saving || loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {currentStep === 4 && (
              <button
                type="button"
                onClick={handleSkipAndSubmit}
                disabled={saving || loading}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Skip & Submit"
                )}
              </button>
            )}
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={saving || loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {currentStep === 4 ? "Add API (Optional)" : "Next"}
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit for Approval
                    <CheckCircle size={20} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
