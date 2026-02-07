"use client"

import { Clock, Mail } from "lucide-react"

export default function PendingApprovalPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-lg">
        <div className="inline-flex w-16 h-16 rounded-full bg-amber-100 items-center justify-center mb-6">
          <Clock size={32} className="text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Thank you for completing your registration.</h1>
        <p className="text-gray-600 mb-4">
          Your account is currently under review.
        </p>
        <p className="text-gray-600 mb-4">
          We will notify you as soon as your approval is complete. If you have any questions or need assistance, please contact us at{" "}
          <a
            href="mailto:info@caratlas.in"
            className="inline-flex items-center gap-1 font-semibold text-primary hover:opacity-80 transition-colors"
          >
            <Mail size={16} />
            info@caratlas.in
          </a>
          .
        </p>
        <p className="text-gray-600">
          We appreciate your patience and look forward to having you on board.
        </p>
      </div>
    </div>
  )
}
