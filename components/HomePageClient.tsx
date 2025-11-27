'use client'

import { useMemo, useRef, useState } from 'react'
import { copyToClipboard } from '@/lib/copyToClipboard'
import { useAutoResizeTextarea } from '@/utils/useAutoResizeTextarea'
import { parseApiResponse } from '@/utils/parseApiResponse'
import { TabKey, SoapOutput, PlanOutput, VisitInfo } from './types'
import TabNavigation from './TabNavigation'
import Header from './Header'
import Footer from './Footer'
import VisitInfoForm from './VisitInfoForm'
import InputFields from './InputFields'
import ActionButtons from './ActionButtons'
import ErrorMessage from './ErrorMessage'
import VisitInfoDisplay from './VisitInfoDisplay'
import SOAPResults from './SOAPResults'
import PlanResults from './PlanResults'
import RecordsTable from './RecordsTable'
import LoadingSpinner from './LoadingSpinner'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

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
  const sInputRef = useRef<HTMLTextAreaElement>(null)
  const oInputRef = useRef<HTMLTextAreaElement>(null)

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
        <Header />

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'soap' && (
          <section>
            <div className="space-y-5">
              <VisitInfoForm
                visitDatetime={visitDatetime}
                selectedNurses={selectedNurses}
                diagnosis={diagnosis}
                onVisitDatetimeChange={setVisitDatetime}
                onNurseToggle={toggleNurse}
                onDiagnosisChange={setDiagnosis}
                disabled={loading}
              />

              <InputFields
                chiefComplaint={chiefComplaint}
                sInput={sInput}
                oInput={oInput}
                onChiefComplaintChange={setChiefComplaint}
                onSInputChange={setSInput}
                onOInputChange={setOInput}
                chiefComplaintRef={chiefComplaintRef}
                sInputRef={sInputRef}
                oInputRef={oInputRef}
                disabled={loading}
              />
            </div>

            <ActionButtons
              onGenerate={handleGenerateSoap}
              onClear={handleClear}
              loading={loading}
              canSubmit={canSubmit}
              generateLabel="SOAP生成（AI）"
            />

            {error && <ErrorMessage message={error} />}

            {/* SOAP表示エリア */}
            {hasResults && (
              <section ref={resultsRef} id="results" className="mt-8 space-y-6">
                {visitInfo && <VisitInfoDisplay visitInfo={visitInfo} />}

                {soapOutput && <SOAPResults soapOutput={soapOutput} />}

                {planOutput && <PlanResults planOutput={planOutput} />}

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
                    {loading ? <LoadingSpinner /> : '初回計画書を生成する'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <PlanResults planOutput={planOutput} />
                <button
                  type="button"
                  onClick={handleCopyPlan}
                  className="w-full rounded-lg bg-green-600 py-3 text-base font-medium text-white transition-colors hover:bg-green-700"
                >
                  {copyState === 'copied' ? '✓ コピーしました' : '計画書をコピー'}
                </button>
              </div>
            )}

            {error && <ErrorMessage message={error} />}
          </section>
        )}

        {activeTab === 'records' && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">記録一覧（準備中）</h2>
            <RecordsTable />
          </section>
        )}

        <Footer />
      </main>
    </div>
  )
}
