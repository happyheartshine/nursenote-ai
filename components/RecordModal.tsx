'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import SOAPOutput from './SOAPOutput'
import { SoapOutput, PlanOutput } from './types'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

interface FullSOAPRecord {
  id: string
  patient_name: string
  visit_date: string
  chief_complaint: string | null
  created_at: string
  diagnosis: string | null
  start_time: string | null
  end_time: string | null
  nurses: string[]
  soap_output: SoapOutput
  plan_output: PlanOutput | null
}

interface RecordModalProps {
  recordId: string | null
  onClose: () => void
}

export default function RecordModal({ recordId, onClose }: RecordModalProps) {
  const [record, setRecord] = useState<FullSOAPRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!recordId) {
      setRecord(null)
      setError(null)
      return
    }

    const fetchRecord = async () => {
      if (!BACKEND_URL) {
        setError('バックエンドURLが設定されていません')
        setLoading(false)
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

        const response = await fetch(`${BACKEND_URL}/records/${recordId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        })

        // Check if response is HTML (error page) instead of JSON
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text()
          console.error('Non-JSON response received:', {
            url: `${BACKEND_URL}/records/${recordId}`,
            status: response.status,
            contentType,
            preview: text.substring(0, 200),
          })
          throw new Error(
            `バックエンドサーバーに接続できません。URLを確認してください: ${BACKEND_URL || '未設定'}`
          )
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'エラーが発生しました' }))
          throw new Error(errorData.error || errorData.detail || `APIエラー: ${response.status}`)
        }

        const data: FullSOAPRecord = await response.json()
        console.log(data)
        setRecord(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching record:', err)
        setError(err instanceof Error ? err.message : '記録の取得中にエラーが発生しました。')
      } finally {
        setLoading(false)
      }
    }

    fetchRecord()
  }, [recordId])

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (recordId) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [recordId, onClose])

  if (!recordId) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">
              {record ? `${record.patient_name} - ${new Date(record.visit_date).toLocaleDateString('ja-JP')}` : '記録詳細'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-sm text-gray-600">読み込み中...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {!loading && !error && record && (
            <SOAPOutput
              soapOutput={record.soap_output}
              planOutput={record.plan_output}
              visitDate={record.visit_date}
              startTime={record.start_time || ''}
              endTime={record.end_time || ''}
              selectedNurses={record.nurses}
              diagnosis={record.diagnosis || ''}
            />
          )}
        </div>
      </div>
    </div>
  )
}

