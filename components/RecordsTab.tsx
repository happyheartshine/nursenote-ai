'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import RecordModal from './RecordModal'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

interface SOAPRecord {
  id: string
  patient_name: string
  visit_date: string
  chief_complaint: string | null
  created_at: string
  diagnosis: string | null
  start_time: string | null
  end_time: string | null
}

interface RecordsResponse {
  records: SOAPRecord[]
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  } catch {
    return dateString
  }
}

export default function RecordsTab() {
  const [records, setRecords] = useState<SOAPRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecords = async () => {
      if (!BACKEND_URL) {
        setError('バックエンドURLが設定されていません')
        setLoading(false)
        return
      }

      try {
        // Get Supabase access token
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setError('認証が必要です。再度ログインしてください。')
          setLoading(false)
          return
        }

        const response = await fetch(`${BACKEND_URL}/records`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'エラーが発生しました' }))
          throw new Error(errorData.error || errorData.detail || `APIエラー: ${response.status}`)
        }

        const data: RecordsResponse = await response.json()
        setRecords(data.records || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching records:', err)
        setError(err instanceof Error ? err.message : '記録の取得中にエラーが発生しました。')
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900">記録一覧</h2>
        </div>

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

        {!loading && !error && records.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">記録がありません</p>
          </div>
        )}

        {!loading && !error && records.length > 0 && (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                onClick={() => setSelectedRecordId(record.id)}
                className="bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:bg-blue-600 transition-colors"></div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(record.visit_date)}　{record.patient_name}
                      </p>
                    </div>
                    {record.chief_complaint && (
                      <p className="text-sm text-gray-600 ml-4">主訴：{record.chief_complaint}</p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Modal */}
      <RecordModal recordId={selectedRecordId} onClose={() => setSelectedRecordId(null)} />
    </div>
  )
}

