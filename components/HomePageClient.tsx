'use client'

import { useMemo, useRef, useState } from 'react'
import OutputCard from '@/components/OutputCard'
import { copyToClipboard } from '@/lib/copyToClipboard'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

type TabKey = 'soap' | 'plan' | 'records'

type SoapSections = Record<'s' | 'o' | 'a' | 'p', string>

type PlanSections = Record<'longTerm' | 'shortTerm' | 'policy', string>

interface ApiResponse {
  output?: string
  error?: string
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'soap', label: 'SOAP作成' },
  { key: 'plan', label: '訪問看護計画書' },
  { key: 'records', label: '記録一覧（準備中）' },
]

const createInitialSoap = (): SoapSections => ({
  s: '',
  o: '',
  a: '',
  p: '',
})

const createInitialPlan = (): PlanSections => ({
  longTerm: '',
  shortTerm: '',
  policy: '',
})

const SOAP_LABELS: Array<{ key: keyof SoapSections; label: string }> = [
  { key: 's', label: 'S（主観）' },
  { key: 'o', label: 'O（客観）' },
  { key: 'a', label: 'A（アセスメント）' },
  { key: 'p', label: 'P（計画）' },
]

const PLAN_LABELS: Array<{ key: keyof PlanSections; label: string }> = [
  { key: 'longTerm', label: '長期目標' },
  { key: 'shortTerm', label: '短期目標' },
  { key: 'policy', label: '看護援助の方針' },
]

function extractSections<T extends Record<string, string>>(
  text: string,
  labels: Array<{ key: keyof T; label: string }>,
  template: T,
): T {
  const result: T = { ...template }
  if (!text) {
    return result
  }

  labels.forEach((config, index) => {
    const labelIndex = text.indexOf(config.label)
    if (labelIndex === -1) {
      return
    }

    const contentStart = labelIndex + config.label.length
    const remaining = text.slice(contentStart)
    let nextIndex = -1

    for (let i = index + 1; i < labels.length; i += 1) {
      const nextLabel = labels[i].label
      const foundIndex = remaining.indexOf(nextLabel)
      if (foundIndex !== -1) {
        nextIndex = contentStart + foundIndex
        break
      }
    }

    const rawContent = nextIndex !== -1 ? text.slice(contentStart, nextIndex) : text.slice(contentStart)
    result[config.key] = rawContent.replace(/^[:：\s]*/, '').trim() as T[keyof T]
  })

  if (!Object.values(result).some(Boolean) && labels.length > 0) {
    result[labels[0].key] = text.trim() as T[keyof T]
  }

  return result
}

function parseApiResponse(text: string): { soap: SoapSections; plan: PlanSections } {
  if (!text) {
    return { soap: createInitialSoap(), plan: createInitialPlan() }
  }

  const normalized = text.replace(/\r\n/g, '\n').trim()
  const planMarker = '【看護計画書】'
  let soapText = normalized
  let planText = ''

  if (normalized.includes(planMarker)) {
    const markerIndex = normalized.indexOf(planMarker)
    soapText = normalized.slice(0, markerIndex).trim()
    planText = normalized.slice(markerIndex + planMarker.length).trim()
  } else {
    const planIndices = PLAN_LABELS.map((label) => normalized.indexOf(label.label)).filter((idx) => idx !== -1)
    if (planIndices.length > 0) {
      const firstPlanIndex = Math.min(...planIndices)
      soapText = normalized.slice(0, firstPlanIndex).trim()
      planText = normalized.slice(firstPlanIndex).trim()
    }
  }

  const soap = extractSections(soapText, SOAP_LABELS, createInitialSoap())
  const plan = extractSections(planText, PLAN_LABELS, createInitialPlan())

  return { soap, plan }
}

export default function HomePageClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('soap')
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [sInput, setSInput] = useState('')
  const [oInput, setOInput] = useState('')
  const [soapSections, setSoapSections] = useState<SoapSections>(createInitialSoap)
  const [planSections, setPlanSections] = useState<PlanSections>(createInitialPlan)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const resultsRef = useRef<HTMLDivElement | null>(null)

  const canSubmit = useMemo(() => {
    return Boolean(chiefComplaint.trim() || sInput.trim() || oInput.trim())
  }, [chiefComplaint, oInput, sInput])

  const hasResults = useMemo(() => {
    return (
      Object.values(soapSections).some((value) => value) ||
      Object.values(planSections).some((value) => value)
    )
  }, [planSections, soapSections])

  const scrollToResults = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleGenerate = async () => {
    if (!canSubmit) {
      setError('主訴またはS・Oのいずれかを入力してください')
      return
    }

    if (!BACKEND_URL) {
      setError('バックエンドURLが設定されていません')
      return
    }

    setLoading(true)
    setError(null)
    setCopyState('idle')
    setSoapSections(createInitialSoap())
    setPlanSections(createInitialPlan())

    try {
      const response = await fetch(`${BACKEND_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chief_complaint: chiefComplaint,
          s: sInput,
          o: oInput,
        }),
      })

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`)
      }

      const contentType = response.headers.get('content-type') || ''
      let responseText = ''

      if (contentType.includes('application/json')) {
        const data: ApiResponse = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        responseText = data.output || ''
      } else {
        responseText = await response.text()
      }

      const { soap, plan } = parseApiResponse(responseText)
      setSoapSections(soap)
      setPlanSections(plan)

      setTimeout(scrollToResults, 100)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setChiefComplaint('')
    setSInput('')
    setOInput('')
    setSoapSections(createInitialSoap())
    setPlanSections(createInitialPlan())
    setError(null)
    setCopyState('idle')
    setActiveTab('soap')
  }

  const handleCopyOutputs = async () => {
    const soapText = [
      `S（主観）:\n${soapSections.s || '（未入力）'}`,
      `O（客観）:\n${soapSections.o || '（未入力）'}`,
      `A（アセスメント）:\n${soapSections.a || '（未入力）'}`,
      `P（計画）:\n${soapSections.p || '（未入力）'}`,
    ].join('\n\n')

    const planText = [
      '【看護計画書】',
      `長期目標:\n${planSections.longTerm || '（未入力）'}`,
      `短期目標:\n${planSections.shortTerm || '（未入力）'}`,
      `看護援助の方針:\n${planSections.policy || '（未入力）'}`,
    ].join('\n\n')

    const success = await copyToClipboard(`${soapText}\n\n${planText}`)
    if (success) {
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } else {
      setError('コピーに失敗しました')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-xl mx-auto px-4 py-6">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">NurseNote AI</h1>
          <p className="text-sm text-gray-600">（精神科訪問看護 記録支援）</p>
        </header>

        <div className="flex gap-2 mb-6" role="tablist" aria-label="アプリケーションタブ">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-gray-100 border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'soap' && (
          <section>
            <div className="space-y-5">
              <div>
                <label htmlFor="chief-complaint" className="block text-sm font-medium text-gray-800 mb-2">
                  主訴（短文でOK）
                </label>
                <input
                  id="chief-complaint"
                  type="text"
                  value={chiefComplaint}
                  onChange={(event) => setChiefComplaint(event.target.value)}
                  placeholder="主訴（短文で入力してください）"
                  className="w-full rounded-lg border border-gray-300 p-4 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="soap-s" className="block text-sm font-medium text-gray-800 mb-2">
                  S（主観：利用者の言葉）
                </label>
                <textarea
                  id="soap-s"
                  value={sInput}
                  onChange={(event) => setSInput(event.target.value)}
                  placeholder="S（任意）"
                  className="w-full min-h-[140px] resize-none rounded-lg border border-gray-300 p-4 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="soap-o" className="block text-sm font-medium text-gray-800 mb-2">
                  O（客観：看護師の観察）
                </label>
                <textarea
                  id="soap-o"
                  value={oInput}
                  onChange={(event) => setOInput(event.target.value)}
                  placeholder="O（任意）"
                  className="w-full min-h-[140px] resize-none rounded-lg border border-gray-300 p-4 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <p>SまたはOのどちらか一方だけでも生成できます</p>
              <p>個人情報は保存されません</p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !canSubmit}
                className="flex-1 sm:basis-[60%] rounded-lg bg-blue-600 py-3 text-lg font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="mr-3 h-5 w-5 animate-spin text-white"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    処理中…
                  </span>
                ) : (
                  'SOAP生成（AI）'
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="flex-1 sm:basis-[40%] rounded-lg border border-gray-300 bg-white py-3 text-lg font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed"
              >
                入力をクリア
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <section ref={resultsRef} id="results" className="mt-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">AI要約（SOAP）</h2>
                <div className="space-y-3">
                  <OutputCard title="S（主観）" content={soapSections.s} />
                  <OutputCard title="O（客観）" content={soapSections.o} />
                  <OutputCard title="A（アセスメント）" content={soapSections.a} />
                  <OutputCard title="P（計画）" content={soapSections.p} />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">看護計画書（案）</h2>
                <div className="space-y-3">
                  <OutputCard title="長期目標" content={planSections.longTerm} />
                  <OutputCard title="短期目標" content={planSections.shortTerm} />
                  <OutputCard title="看護援助の方針" content={planSections.policy} />
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyOutputs}
                disabled={!hasResults}
                className="w-full rounded-lg bg-green-600 py-3 text-base font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {copyState === 'copied' ? '✓ コピーしました' : '出力をコピー'}
              </button>
            </section>
          </section>
        )}

        {activeTab === 'plan' && (
          <section className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">訪問看護計画書</h2>
            {Object.values(planSections).some((value) => value) ? (
              <div className="space-y-4">
                <OutputCard title="長期目標" content={planSections.longTerm} />
                <OutputCard title="短期目標" content={planSections.shortTerm} />
                <OutputCard title="看護援助の方針" content={planSections.policy} />
                <button
                  type="button"
                  onClick={handleCopyOutputs}
                  className="w-full rounded-lg bg-green-600 py-3 text-base font-medium text-white transition-colors hover:bg-green-700"
                >
                  {copyState === 'copied' ? '✓ コピーしました' : '出力をコピー'}
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                先に『SOAP作成』タブでAI生成を行ってください。
              </div>
            )}
          </section>
        )}

        {activeTab === 'records' && (
          <section className="text-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">記録一覧（準備中）</h2>
            <p className="text-sm text-gray-600">
              フェーズ2で、利用者ごとの記録蓄積・状態変化の表示を実装予定です。
            </p>
          </section>
        )}

        <footer className="mt-10 border-t border-gray-200 pt-5 text-center text-xs text-gray-500 space-y-1">
          <p>※生成文章は看護師の判断で調整のうえ使用してください</p>
          <p>※データはサーバに保存されません</p>
        </footer>
      </main>
    </div>
  )
}

