'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import OutputCard from '@/components/OutputCard'
import { copyToClipboard } from '@/lib/copyToClipboard'
import { useAutoResizeTextarea } from '@/utils/useAutoResizeTextarea'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

type TabKey = 'soap' | 'plan' | 'records'

interface StructuredA {
  症状推移: string
  リスク評価: string
  背景要因: string
  次回観察ポイント: string
}

interface StructuredP {
  本日実施した援助: string
  次回以降の方針: string
}

interface SoapOutput {
  s: string
  o: string
  a: StructuredA
  p: StructuredP
}

interface PlanOutput {
  長期目標: string
  短期目標: string
  看護援助の方針: string
}

interface VisitInfo {
  visit_datetime: string
  nurses: string[]
  diagnosis: string
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'soap', label: 'SOAP作成' },
  { key: 'plan', label: '訪問看護計画書' },
  { key: 'records', label: '記録一覧（準備中）' },
]

const NURSE_OPTIONS = ['吉村', 'A子', 'B子']
const DIAGNOSIS_OPTIONS = ['統合失調症', '双極性障害', 'うつ病', 'その他']

const DUMMY_RECORDS = [
  {
    visitDate: '2024-01-15',
    patientName: '山田 太郎',
    chiefComplaint: '気分が落ち込んでいる',
    soapExcerpt: 'S: 最近眠れない日が続いている\nA: 睡眠リズムの乱れが認められる',
  },
  {
    visitDate: '2024-01-10',
    patientName: '佐藤 花子',
    chiefComplaint: '服薬を忘れがち',
    soapExcerpt: 'S: 薬を飲むのを忘れてしまう\nA: 服薬管理の支援が必要',
  },
  {
    visitDate: '2024-01-08',
    patientName: '鈴木 一郎',
    chiefComplaint: '体調が良い',
    soapExcerpt: 'S: 調子が良い\nA: 安定した状態を維持',
  },
]

// Voice recognition hook
function useSpeechRecognition(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'ja-JP'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onResult])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err) {
        console.error('Speech recognition error:', err)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  return { isListening, startListening, stopListening }
}

// Voice input button component
function VoiceInputButton({
  onResult,
  disabled,
}: {
  onResult: (text: string) => void
  disabled?: boolean
}) {
  const { isListening, startListening, stopListening } = useSpeechRecognition(onResult)

  const handleClick = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const isSupported =
    typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  if (!isSupported) {
    return null
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`rounded-full p-2 transition-colors ${
        isListening
          ? 'bg-red-100 text-red-600'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isListening ? '音声入力を停止' : '音声入力'}
    >
      {isListening ? '⏹️' : '🎤'}
    </button>
  )
}

// Parse API response into structured format
function parseApiResponse(text: string): { soap: SoapOutput; plan: PlanOutput } {
  const initialSoap: SoapOutput = {
    s: '',
    o: '',
    a: {
      症状推移: '',
      リスク評価: '',
      背景要因: '',
      次回観察ポイント: '',
    },
    p: {
      本日実施した援助: '',
      次回以降の方針: '',
    },
  }

  const initialPlan: PlanOutput = {
    長期目標: '',
    短期目標: '',
    看護援助の方針: '',
  }

  if (!text) {
    return { soap: initialSoap, plan: initialPlan }
  }

  const normalized = text.replace(/\r\n/g, '\n').trim()

  // Split SOAP and Plan sections
  const planMarker = '【看護計画書】'
  let soapText = normalized
  let planText = ''

  if (normalized.includes(planMarker)) {
    const markerIndex = normalized.indexOf(planMarker)
    soapText = normalized.slice(0, markerIndex).trim()
    planText = normalized.slice(markerIndex + planMarker.length).trim()
  }

  // Parse S
  const sMatch = soapText.match(/S[（(]主観[）)]\s*[:：]?\s*\n?(.+?)(?=\n\s*O[（(]客観[）)]|$)/s)
  if (sMatch) {
    initialSoap.s = sMatch[1].trim()
  }

  // Parse O
  const oMatch = soapText.match(/O[（(]客観[）)]\s*[:：]?\s*\n?(.+?)(?=\n\s*A[（(]アセスメント[）)]|$)/s)
  if (oMatch) {
    initialSoap.o = oMatch[1].trim()
  }

  // Parse A with sub-sections
  const aMatch = soapText.match(/A[（(]アセスメント[）)]\s*[:：]?\s*\n?(.+?)(?=\n\s*P[（(]計画[）)]|$)/s)
  if (aMatch) {
    const aContent = aMatch[1]

    // Extract sub-sections
    const symptomMatch = aContent.match(/症状推移\s*[:：]?\s*\n?(.+?)(?=\n\s*[・•]\s*リスク評価|$)/s)
    if (symptomMatch) {
      initialSoap.a.症状推移 = symptomMatch[1].trim()
    }

    const riskMatch = aContent.match(/リスク評価[（(]自殺[・・]他害[・・]服薬[）)]\s*[:：]?\s*\n?(.+?)(?=\n\s*[・•]\s*背景要因|$)/s)
    if (riskMatch) {
      initialSoap.a.リスク評価 = riskMatch[1].trim()
    }

    const backgroundMatch = aContent.match(/背景要因\s*[:：]?\s*\n?(.+?)(?=\n\s*[・•]\s*次回観察ポイント|$)/s)
    if (backgroundMatch) {
      initialSoap.a.背景要因 = backgroundMatch[1].trim()
    }

    const observationMatch = aContent.match(/次回観察ポイント\s*[:：]?\s*\n?(.+?)(?=\n\s*P[（(]計画[）)]|$)/s)
    if (observationMatch) {
      initialSoap.a.次回観察ポイント = observationMatch[1].trim()
    }

    // Fallback: if structured parsing fails, put all content in 症状推移
    if (!Object.values(initialSoap.a).some((v) => v)) {
      initialSoap.a.症状推移 = aContent.trim()
    }
  }

  // Parse P with sub-sections
  const pMatch = soapText.match(/P[（(]計画[）)]\s*[:：]?\s*\n?(.+?)(?=\n\s*【看護計画書】|$)/s)
  if (pMatch) {
    const pContent = pMatch[1]

    const todayMatch = pContent.match(/本日実施した援助\s*[:：]?\s*\n?(.+?)(?=\n\s*次回以降の方針|$)/s)
    if (todayMatch) {
      initialSoap.p.本日実施した援助 = todayMatch[1].trim()
    }

    const futureMatch = pContent.match(/次回以降の方針\s*[:：]?\s*\n?(.+?)(?=\n\s*【看護計画書】|$)/s)
    if (futureMatch) {
      initialSoap.p.次回以降の方針 = futureMatch[1].trim()
    }

    // Fallback: if structured parsing fails, put all content in 本日実施した援助
    if (!Object.values(initialSoap.p).some((v) => v)) {
      initialSoap.p.本日実施した援助 = pContent.trim()
    }
  }

  // Parse Plan sections
  const longTermMatch = planText.match(/長期目標\s*[:：]?\s*\n?(.+?)(?=\n\s*短期目標|$)/s)
  if (longTermMatch) {
    initialPlan.長期目標 = longTermMatch[1].trim()
  }

  const shortTermMatch = planText.match(/短期目標\s*[:：]?\s*\n?(.+?)(?=\n\s*看護援助の方針|$)/s)
  if (shortTermMatch) {
    initialPlan.短期目標 = shortTermMatch[1].trim()
  }

  const policyMatch = planText.match(/看護援助の方針\s*[:：]?\s*\n?(.+?)$/s)
  if (policyMatch) {
    initialPlan.看護援助の方針 = policyMatch[1].trim()
  }

  return { soap: initialSoap, plan: initialPlan }
}

export default function HomePageClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('soap')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  // Visit info
  const [visitDatetime, setVisitDatetime] = useState('')
  const [selectedNurses, setSelectedNurses] = useState<string[]>([])
  const [diagnosis, setDiagnosis] = useState('')

  // Input fields
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [sInput, setSInput] = useState('')
  const [oInput, setOInput] = useState('')

  // Output
  const [visitInfo, setVisitInfo] = useState<VisitInfo | null>(null)
  const [soapOutput, setSoapOutput] = useState<SoapOutput | null>(null)
  const [planOutput, setPlanOutput] = useState<PlanOutput | null>(null)

  // Refs
  const resultsRef = useRef<HTMLDivElement>(null)
  const chiefComplaintRef = useAutoResizeTextarea(chiefComplaint)
  const sInputRef = useAutoResizeTextarea(sInput)
  const oInputRef = useAutoResizeTextarea(oInput)

  const canSubmit = useMemo(() => {
    return Boolean(chiefComplaint.trim() || sInput.trim() || oInput.trim())
  }, [chiefComplaint, sInput, oInput])

  const hasResults = useMemo(() => {
    return soapOutput !== null || planOutput !== null
  }, [soapOutput, planOutput])

  const scrollToResults = () => {
    if (resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  const handleGenerateSoap = async () => {
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

    try {
      const response = await fetch(`${BACKEND_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visit_datetime: visitDatetime || new Date().toISOString(),
          nurses: selectedNurses.length > 0 ? selectedNurses : [],
          chief_complaint: chiefComplaint,
          s: sInput,
          o: oInput,
          diagnosis: diagnosis || '',
        }),
      })

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`)
      }

      const contentType = response.headers.get('content-type') || ''
      let responseText = ''

      if (contentType.includes('application/json')) {
        const data = await response.json()
        responseText = data.output || ''
      } else {
        responseText = await response.text()
      }

      const { soap, plan } = parseApiResponse(responseText)

      // Save visit info
      setVisitInfo({
        visit_datetime: visitDatetime,
        nurses: selectedNurses,
        diagnosis: diagnosis,
      })

      setSoapOutput(soap)
      setPlanOutput(plan)

      scrollToResults()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePlan = async () => {
    if (!diagnosis) {
      setError('主疾患を選択してください')
      return
    }

    if (!sInput.trim() && !oInput.trim()) {
      setError('SまたはOを入力してください')
      return
    }

    if (!BACKEND_URL) {
      setError('バックエンドURLが設定されていません')
      return
    }

    setLoading(true)
    setError(null)
    setCopyState('idle')

    try {
      const response = await fetch(`${BACKEND_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visit_datetime: visitDatetime || new Date().toISOString(),
          nurses: selectedNurses.length > 0 ? selectedNurses : [],
          chief_complaint: chiefComplaint,
          s: sInput,
          o: oInput,
          diagnosis: diagnosis,
        }),
      })

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`)
      }

      const contentType = response.headers.get('content-type') || ''
      let responseText = ''

      if (contentType.includes('application/json')) {
        const data = await response.json()
        responseText = data.output || ''
      } else {
        responseText = await response.text()
      }

      const { plan } = parseApiResponse(responseText)
      setPlanOutput(plan)

      scrollToResults()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setVisitDatetime('')
    setSelectedNurses([])
    setDiagnosis('')
    setChiefComplaint('')
    setSInput('')
    setOInput('')
    setVisitInfo(null)
    setSoapOutput(null)
    setPlanOutput(null)
    setError(null)
    setCopyState('idle')
    setActiveTab('soap')
  }

  const handleCopySoap = async () => {
    if (!soapOutput && !visitInfo) return

    const lines: string[] = []

    if (visitInfo) {
      if (visitInfo.visit_datetime) {
        const date = new Date(visitInfo.visit_datetime)
        lines.push(`訪問日時: ${date.toLocaleString('ja-JP')}`)
      }
      if (visitInfo.nurses.length > 0) {
        lines.push(`本日の訪問担当: ${visitInfo.nurses.join('・')}`)
      }
      if (visitInfo.diagnosis) {
        lines.push(`主疾患: ${visitInfo.diagnosis}`)
      }
      lines.push('')
    }

    lines.push('S（主観）:')
    lines.push(soapOutput?.s || '（未入力）')
    lines.push('')
    lines.push('O（客観）:')
    lines.push(soapOutput?.o || '（未入力）')
    lines.push('')
    lines.push('A（アセスメント）:')
    if (soapOutput?.a) {
      lines.push('・症状推移')
      lines.push(soapOutput.a.症状推移 || '（未入力）')
      lines.push('・リスク評価（自殺・他害・服薬）')
      lines.push(soapOutput.a.リスク評価 || '（未入力）')
      lines.push('・背景要因')
      lines.push(soapOutput.a.背景要因 || '（未入力）')
      lines.push('・次回観察ポイント')
      lines.push(soapOutput.a.次回観察ポイント || '（未入力）')
    }
    lines.push('')
    lines.push('P（計画）:')
    if (soapOutput?.p) {
      lines.push('本日実施した援助:')
      lines.push(soapOutput.p.本日実施した援助 || '（未入力）')
      lines.push('')
      lines.push('次回以降の方針:')
      lines.push(soapOutput.p.次回以降の方針 || '（未入力）')
    }

    const success = await copyToClipboard(lines.join('\n'))
    if (success) {
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } else {
      setError('コピーに失敗しました')
    }
  }

  const handleCopyPlan = async () => {
    if (!planOutput) return

    const lines: string[] = []
    lines.push('【看護計画書】')
    lines.push('')
    lines.push('長期目標:')
    lines.push(planOutput.長期目標 || '（未入力）')
    lines.push('')
    lines.push('短期目標:')
    lines.push(planOutput.短期目標 || '（未入力）')
    lines.push('')
    lines.push('看護援助の方針:')
    lines.push(planOutput.看護援助の方針 || '（未入力）')

    const success = await copyToClipboard(lines.join('\n'))
    if (success) {
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } else {
      setError('コピーに失敗しました')
    }
  }

  const toggleNurse = (nurse: string) => {
    setSelectedNurses((prev) =>
      prev.includes(nurse) ? prev.filter((n) => n !== nurse) : [...prev, nurse]
    )
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
              {/* 1. 利用者情報入力 */}
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-4">
                <h2 className="text-base font-semibold text-gray-800 mb-3">1. 利用者情報入力</h2>

                <div>
                  <label htmlFor="visit-datetime" className="block text-sm font-medium text-gray-800 mb-2">
                    訪問日時
                  </label>
                  <input
                    id="visit-datetime"
                    type="datetime-local"
                    value={visitDatetime}
                    onChange={(e) => setVisitDatetime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">看護師名</label>
                  <div className="flex flex-wrap gap-3">
                    {NURSE_OPTIONS.map((nurse) => (
                      <label
                        key={nurse}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedNurses.includes(nurse)}
                          onChange={() => toggleNurse(nurse)}
                          disabled={loading}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{nurse}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-800 mb-2">
                    主疾患
                  </label>
                  <select
                    id="diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    disabled={loading}
                  >
                    <option value="">選択してください</option>
                    {DIAGNOSIS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. 入力欄 */}
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-gray-800 mb-3">2. 入力欄</h2>

                <div>
                  <label htmlFor="chief-complaint" className="block text-sm font-medium text-gray-800 mb-2">
                    主訴（短文）
                  </label>
                  <div className="relative flex items-start">
                    <textarea
                      ref={chiefComplaintRef}
                      id="chief-complaint"
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      placeholder="主訴（短文で入力してください）"
                      className="flex-1 min-h-[60px] resize-none rounded-lg border border-gray-300 p-4 pr-12 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      disabled={loading}
                      rows={1}
                    />
                    <div className="absolute right-2 top-2">
                      <VoiceInputButton
                        onResult={(text) => setChiefComplaint((prev) => prev + (prev ? ' ' : '') + text)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="soap-s" className="block text-sm font-medium text-gray-800 mb-2">
                    S（subjective）
                  </label>
                  <div className="relative flex items-start">
                    <textarea
                      ref={sInputRef}
                      id="soap-s"
                      value={sInput}
                      onChange={(e) => setSInput(e.target.value)}
                      placeholder="S（任意）"
                      className="flex-1 min-h-[140px] resize-none rounded-lg border border-gray-300 p-4 pr-12 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      disabled={loading}
                      rows={4}
                    />
                    <div className="absolute right-2 top-2">
                      <VoiceInputButton
                        onResult={(text) => setSInput((prev) => prev + (prev ? '\n' : '') + text)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="soap-o" className="block text-sm font-medium text-gray-800 mb-2">
                    O（objective）
                  </label>
                  <div className="relative flex items-start">
                    <textarea
                      ref={oInputRef}
                      id="soap-o"
                      value={oInput}
                      onChange={(e) => setOInput(e.target.value)}
                      placeholder="O（任意）"
                      className="flex-1 min-h-[140px] resize-none rounded-lg border border-gray-300 p-4 pr-12 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      disabled={loading}
                      rows={4}
                    />
                    <div className="absolute right-2 top-2">
                      <VoiceInputButton
                        onResult={(text) => setOInput((prev) => prev + (prev ? '\n' : '') + text)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. ボタン群 */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleGenerateSoap}
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

            {/* SOAP表示エリア */}
            {hasResults && (
              <section ref={resultsRef} id="results" className="mt-8 space-y-6">
                {visitInfo && (
                  <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">訪問情報</h3>
                    <div className="space-y-1 text-sm text-gray-700">
                      {visitInfo.visit_datetime && (
                        <p>
                          訪問日時:{' '}
                          {new Date(visitInfo.visit_datetime).toLocaleString('ja-JP')}
                        </p>
                      )}
                      {visitInfo.nurses.length > 0 && (
                        <p>本日の訪問担当: {visitInfo.nurses.join('・')}</p>
                      )}
                      {visitInfo.diagnosis && <p>主疾患: {visitInfo.diagnosis}</p>}
                    </div>
                  </div>
                )}

                {soapOutput && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">SOAP</h2>
                    <div className="space-y-3">
                      <OutputCard title="S（主観）" content={soapOutput.s} />
                      <OutputCard title="O（客観）" content={soapOutput.o} />

                      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                        <h3 className="text-base font-semibold mb-3 text-gray-800">A（アセスメント）</h3>
                        <div className="space-y-3">
                          <OutputCard title="症状推移" content={soapOutput.a.症状推移} />
                          <OutputCard
                            title="リスク評価（自殺・他害・服薬）"
                            content={soapOutput.a.リスク評価}
                          />
                          <OutputCard title="背景要因" content={soapOutput.a.背景要因} />
                          <OutputCard title="次回観察ポイント" content={soapOutput.a.次回観察ポイント} />
                        </div>
                      </div>

                      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                        <h3 className="text-base font-semibold mb-3 text-gray-800">P（計画）</h3>
                        <div className="space-y-3">
                          <OutputCard title="本日実施した援助" content={soapOutput.p.本日実施した援助} />
                          <OutputCard title="次回以降の方針" content={soapOutput.p.次回以降の方針} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 計画書エリア */}
                {planOutput && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">【看護計画書】</h2>
                    <div className="space-y-3">
                      <OutputCard title="長期目標" content={planOutput.長期目標} />
                      <OutputCard title="短期目標" content={planOutput.短期目標} />
                      <OutputCard title="看護援助の方針" content={planOutput.看護援助の方針} />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {soapOutput && (
                    <button
                      type="button"
                      onClick={handleCopySoap}
                      className="flex-1 rounded-lg bg-green-600 py-3 text-base font-medium text-white transition-colors hover:bg-green-700"
                    >
                      {copyState === 'copied' ? '✓ コピーしました' : 'SOAPをコピー'}
                    </button>
                  )}
                  {planOutput && (
                    <button
                      type="button"
                      onClick={handleCopyPlan}
                      className="flex-1 rounded-lg bg-green-600 py-3 text-base font-medium text-white transition-colors hover:bg-green-700"
                    >
                      {copyState === 'copied' ? '✓ コピーしました' : '計画書をコピー'}
                    </button>
                  )}
                </div>
              </section>
            )}
          </section>
        )}

        {activeTab === 'plan' && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">訪問看護計画書</h2>

            {!planOutput ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                  <p className="text-sm text-gray-600 mb-4">先に初回計画書を生成してください</p>
                  <button
                    type="button"
                    onClick={handleGeneratePlan}
                    disabled={loading || !diagnosis || (!sInput.trim() && !oInput.trim())}
                    className="rounded-lg bg-blue-600 py-3 px-6 text-lg font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
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
                      '初回計画書を生成する'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <OutputCard title="長期目標" content={planOutput.長期目標} />
                  <OutputCard title="短期目標" content={planOutput.短期目標} />
                  <OutputCard title="看護援助の方針" content={planOutput.看護援助の方針} />
                </div>
                <button
                  type="button"
                  onClick={handleCopyPlan}
                  className="w-full rounded-lg bg-green-600 py-3 text-base font-medium text-white transition-colors hover:bg-green-700"
                >
                  {copyState === 'copied' ? '✓ コピーしました' : '計画書をコピー'}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
          </section>
        )}

        {activeTab === 'records' && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">記録一覧（準備中）</h2>
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">訪問日</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">利用者名</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">主訴</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">SOAP抜粋</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {DUMMY_RECORDS.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">{record.visitDate}</td>
                        <td className="px-4 py-3 text-gray-700">{record.patientName}</td>
                        <td className="px-4 py-3 text-gray-700">{record.chiefComplaint}</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-pre-wrap">
                          {record.soapExcerpt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
