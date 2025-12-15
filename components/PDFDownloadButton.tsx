'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

/**
 * Props for PDFDownloadButton component
 */
interface PDFDownloadButtonProps {
  /** Button label text */
  label: string
  /** API endpoint URL (relative to BACKEND_URL) */
  endpoint: string
  /** Optional query parameters as object */
  queryParams?: Record<string, string | number>
  /** Optional filename for downloaded PDF */
  filename?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Reusable PDF download button component
 * 
 * Handles:
 * - Fetching PDF from backend
 * - Converting response to Blob
 * - Triggering browser download
 * - Loading and error states
 */
export default function PDFDownloadButton({
  label,
  endpoint,
  queryParams,
  filename,
  className = '',
}: PDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Builds the full API URL with query parameters
   */
  const buildUrl = (): string => {
    let url = `${BACKEND_URL}${endpoint}`
    
    if (queryParams) {
      const params = new URLSearchParams()
      Object.entries(queryParams).forEach(([key, value]) => {
        params.append(key, String(value))
      })
      url += `?${params.toString()}`
    }
    
    return url
  }

  /**
   * Downloads PDF from backend and triggers browser download
   */
  const handleDownload = async () => {
    if (!BACKEND_URL) {
      setError('バックエンドURLが設定されていません')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get Supabase access token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('認証が必要です。再度ログインしてください。')
        setLoading(false)
        return
      }

      const url = buildUrl()
      
      // Fetch PDF from backend
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      })

      // Check if response is OK
      if (!response.ok) {
        // Try to parse error message
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || errorData.detail || `エラー: ${response.status}`)
        } else {
          throw new Error(`PDF生成に失敗しました: ${response.status}`)
        }
      }

      // Check if response is PDF
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/pdf')) {
        // Convert response to Blob
        const blob = await response.blob()
        
        // Create object URL
        const blobUrl = window.URL.createObjectURL(blob)
        
        // Create temporary anchor element and trigger download
        const link = document.createElement('a')
        link.href = blobUrl
        
        // Use filename from Content-Disposition header or provided filename
        const contentDisposition = response.headers.get('content-disposition')
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (filenameMatch && filenameMatch[1]) {
            link.download = filenameMatch[1].replace(/['"]/g, '')
          } else {
            link.download = filename || 'download.pdf'
          }
        } else {
          link.download = filename || 'download.pdf'
        }
        
        // Trigger download
        document.body.appendChild(link)
        link.click()
        
        // Cleanup
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      } else {
        // Handle case where backend returns JSON with URL (for monthly reports)
        const data = await response.json()
        if (data.pdf_url) {
          // Download from presigned URL
          const pdfResponse = await fetch(data.pdf_url)
          const blob = await pdfResponse.blob()
          const blobUrl = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = filename || `monthly_report_${data.s3_key?.split('/').pop() || 'download'}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(blobUrl)
        } else {
          throw new Error('PDFデータが取得できませんでした')
        }
      }
    } catch (err) {
      console.error('Error downloading PDF:', err)
      setError(err instanceof Error ? err.message : 'PDFのダウンロード中にエラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="
          w-full px-4 py-2 
          bg-white hover:bg-gray-50 
          disabled:bg-gray-200 disabled:cursor-not-allowed
          text-blue-600 font-semibold text-sm
          border border-blue-200
          rounded-lg shadow-sm
          transition-colors duration-200
          active:scale-[0.98]
          touch-manipulation
        "
        aria-label={label}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            生成中...
          </span>
        ) : (
          label
        )}
      </button>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}

