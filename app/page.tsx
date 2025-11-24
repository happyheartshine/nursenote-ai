'use client'

import { useState } from 'react'
import OutputCard from '@/components/OutputCard'
import { copyToClipboard } from '@/lib/copyToClipboard'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

interface ApiResponse {
  output?: string
  error?: string
}

function parseResponse(text: string): { soap: string; plan: string } {
  const lines = text.split('\n')
  let soap = ''
  let plan = ''
  let currentSection = 'soap'
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    if (line.includes('【看護計画書】') || line.includes('看護計画書')) {
      currentSection = 'plan'
      continue
    }
    
    if (currentSection === 'soap') {
      soap += line + '\n'
    } else {
      plan += line + '\n'
    }
  }
  
  // Clean up the sections
  soap = soap.trim()
  plan = plan.trim()
  
  // If no plan section found, try to detect it
  if (!plan && text.includes('長期目標')) {
    const planIndex = text.indexOf('長期目標')
    soap = text.substring(0, planIndex).trim()
    plan = text.substring(planIndex).trim()
  }
  
  return { soap, plan }
}

export default function Home() {
  const [input, setInput] = useState('')
  const [soapOutput, setSoapOutput] = useState('')
  const [planOutput, setPlanOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('入力欄に記録を入力してください')
      return
    }
    console.log('--------------', BACKEND_URL);
    if (!BACKEND_URL) {
      setError('バックエンドURLが設定されていません')
      return
    }

    setLoading(true)
    setError('')
    setSoapOutput('')
    setPlanOutput('')
    setCopySuccess(false)

    try {
      const response = await fetch(`${BACKEND_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: input }),
      })

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`)
      }

      // Handle both JSON and plain text responses
      const contentType = response.headers.get('content-type')
      let responseText = ''
      
      if (contentType && contentType.includes('application/json')) {
        const data: ApiResponse = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        responseText = data.output || ''
      } else {
        // Plain text response
        responseText = await response.text()
      }

      const { soap, plan } = parseResponse(responseText)
      
      setSoapOutput(soap)
      setPlanOutput(plan)

      // Scroll to results
      setTimeout(() => {
        const resultsSection = document.getElementById('results')
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setInput('')
    setSoapOutput('')
    setPlanOutput('')
    setError('')
    setCopySuccess(false)
  }

  const handleCopyAll = async () => {
    const fullOutput = `AI要約（SOAP）\n\n${soapOutput}\n\n看護計画書（案）\n\n${planOutput}`
    const success = await copyToClipboard(fullOutput)
    if (success) {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } else {
      setError('コピーに失敗しました')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            NurseNote AI
          </h1>
          <p className="text-sm text-gray-600">
            （精神科訪問看護 記録支援）
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="訪問記録（自由記述）を入力してください"
            className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-2">
            個人情報は保存されません
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="flex-1 py-3 text-lg font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                処理中...
              </span>
            ) : (
              '要約する（AI）'
            )}
          </button>
          <button
            onClick={handleClear}
            disabled={loading}
            className="px-6 py-3 text-lg font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            入力をクリア
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Results Section */}
        <div id="results">
          {/* SOAP Output */}
          {(soapOutput || planOutput) && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  AI要約（SOAP）
                </h2>
                <OutputCard title="" content={soapOutput} />
              </div>

              {/* Nursing Plan Output */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  看護計画書（案）
                </h2>
                <OutputCard title="" content={planOutput} />
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopyAll}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-base font-medium mb-8"
              >
                {copySuccess ? '✓ コピーしました' : '出力をコピー'}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500 space-y-1">
          <p>※生成文章は看護師の判断で調整のうえ使用してください</p>
          <p>※データはサーバに保存されません</p>
        </footer>
      </div>
    </div>
  )
}

