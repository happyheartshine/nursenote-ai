'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

interface PDFPreviewButtonProps {
  label?: string
  endpoint: string
  queryParams?: Record<string, string | number>
  onPreviewReady: (url: string | null) => void
  isActive?: boolean
  className?: string
}

export default function PDFPreviewButton({
  label = 'PDFプレビュー',
  endpoint,
  queryParams,
  onPreviewReady,
  isActive = false,
  className = '',
}: PDFPreviewButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handlePreview = async () => {
    // Toggle off: if already active, just close preview without refetching
    if (isActive) {
      onPreviewReady(null)
      return
    }

    if (!BACKEND_URL) {
      setError('バックエンドURLが設定されていません')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        setError('認証が必要です。再度ログインしてください。')
        setLoading(false)
        return
      }

      const url = buildUrl()

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || errorData.detail || `エラー: ${response.status}`)
        } else {
          throw new Error(`PDF生成に失敗しました: ${response.status}`)
        }
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('PDFデータが取得できませんでした')
      }

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      onPreviewReady(blobUrl)
    } catch (err) {
      console.error('Error fetching PDF for preview:', err)
      setError(err instanceof Error ? err.message : 'PDFプレビュー中にエラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        onClick={handlePreview}
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
        {loading ? 'プレビュー生成中...' : label}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}


