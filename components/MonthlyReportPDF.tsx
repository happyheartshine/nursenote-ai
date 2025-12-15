'use client'

import { useState, useEffect } from 'react'
import PDFDownloadButton from './PDFDownloadButton'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

/**
 * Props for MonthlyReportPDF component
 */
interface MonthlyReportPDFProps {
  /** Patient ID (patient_name) for the monthly report */
  patientId: string
  /** Optional additional CSS classes */
  className?: string
}

/**
 * Monthly Report PDF Generator Component
 * 
 * Provides year/month selection and PDF download functionality
 * for monthly reports (月次レポート)
 */
export default function MonthlyReportPDF({ patientId, className = '' }: MonthlyReportPDFProps) {
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1)

  // Generate year options (current year and past 5 years)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i)

  // Generate month options (1-12)
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Year and Month Selection */}
      <div className="grid grid-cols-2 gap-4">
        {/* Year Select */}
        <div>
          <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-2">
            年
          </label>
          <select
            id="year-select"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="
              w-full px-4 py-3
              border border-gray-300 rounded-lg
              bg-white text-gray-900 text-base
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              touch-manipulation
            "
            aria-label="年を選択"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
        </div>

        {/* Month Select */}
        <div>
          <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-2">
            月
          </label>
          <select
            id="month-select"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="
              w-full px-4 py-3
              border border-gray-300 rounded-lg
              bg-white text-gray-900 text-base
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              touch-manipulation
            "
            aria-label="月を選択"
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PDF Download Button */}
      {/* <PDFDownloadButton
        label="月次レポートPDFを生成"
        endpoint={`/pdf/monthly-report/${patientId}`}
        queryParams={{
          year,
          month,
        }}
        filename={`monthly_report_${patientId}_${year}${String(month).padStart(2, '0')}.pdf`}
      /> */}
    </div>
  )
}

