'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { parseApiResponse } from '@/utils/parseApiResponse'
import { copyToClipboard } from '@/lib/copyToClipboard'
import VoiceInputButton from './VoiceInputButton'
import SOAPOutput from './SOAPOutput'
import { SoapOutput, PlanOutput } from './types'

const DIAGNOSIS_OPTIONS = [
  '統合失調症',
  '双極性障害',
  'うつ病',
  '不安障害',
  '発達障害',
  'アルコール関連',
  'その他',
]

const NURSE_OPTIONS = ['吉村', 'A子', 'B子', 'C子']

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

// Maximum height for textareas before scrolling is enabled
const MAX_TEXTAREA_HEIGHT = 200 // pixels

// Default values for optional fields
const getDefaultValues = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const todayStr = `${year}-${month}-${day}`
  
  return {
    userName: '利用者',
    diagnosis: DIAGNOSIS_OPTIONS[0] || '',
    selectedNurses: NURSE_OPTIONS[0] ? [NURSE_OPTIONS[0]] : [],
    visitDate: todayStr,
    startTime: '09:00',
    endTime: '10:00',
    chiefComplaint: '',
  }
}

export default function SOAPTab() {
  // Form state
  const [userName, setUserName] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [selectedNurses, setSelectedNurses] = useState<string[]>([])
  const [visitDate, setVisitDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [sText, setSText] = useState('')
  const [oText, setOText] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [soapOutput, setSoapOutput] = useState<SoapOutput | null>(null)
  const [planOutput, setPlanOutput] = useState<PlanOutput | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  // Refs
  const resultsRef = useRef<HTMLDivElement>(null)
  const sTextareaRef = useRef<HTMLTextAreaElement>(null)
  const oTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textareas with max height
  useEffect(() => {
    if (sTextareaRef.current) {
      sTextareaRef.current.style.height = 'auto'
      const scrollHeight = sTextareaRef.current.scrollHeight
      const newHeight = Math.min(scrollHeight, MAX_TEXTAREA_HEIGHT)
      sTextareaRef.current.style.height = `${newHeight}px`
    }
  }, [sText])

  useEffect(() => {
    if (oTextareaRef.current) {
      oTextareaRef.current.style.height = 'auto'
      const scrollHeight = oTextareaRef.current.scrollHeight
      const newHeight = Math.min(scrollHeight, MAX_TEXTAREA_HEIGHT)
      oTextareaRef.current.style.height = `${newHeight}px`
    }
  }, [oText])

  const canSubmit = useMemo(() => {
    // Only require S or O text
    return Boolean(sText.trim() || oText.trim())
  }, [sText, oText])

  const scrollToResults = () => {
    if (resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  const handleGenerate = async () => {
    if (!canSubmit) {
      setError('S（主観）またはO（客観）のいずれかを入力してください')
      return
    }

    if (!BACKEND_URL) {
      setError('バックエンドURLが設定されていません')
      return
    }

    setLoading(true)
    setError(null)
    setCopyState('idle')

    // Get default values
    const defaults = getDefaultValues()

    try {
      const response = await fetch(`${BACKEND_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: userName.trim() || defaults.userName,
          diagnosis: diagnosis || defaults.diagnosis,
          nurses: selectedNurses.length > 0 ? selectedNurses : defaults.selectedNurses,
          visitDate: visitDate || defaults.visitDate,
          startTime: startTime || defaults.startTime,
          endTime: endTime || defaults.endTime,
          chiefComplaint: chiefComplaint.trim() || defaults.chiefComplaint,
          sText,
          oText,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'エラーが発生しました' }))
        throw new Error(errorData.error || `APIエラー: ${response.status}`)
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

  const handleClear = () => {
    setUserName('')
    setDiagnosis('')
    setSelectedNurses([])
    setVisitDate('')
    setStartTime('')
    setEndTime('')
    setChiefComplaint('')
    setSText('')
    setOText('')
    setSoapOutput(null)
    setPlanOutput(null)
    setError(null)
    setCopyState('idle')
  }

  const handleCopy = async () => {
    if (!soapOutput) return

    const lines: string[] = []

    // SOAP sections
    lines.push('S（主観）')
    lines.push(soapOutput.s || '（未入力）')
    lines.push('')
    lines.push('O（客観）')
    lines.push(soapOutput.o || '（未入力）')
    lines.push('')
    lines.push('A（アセスメント）')
    lines.push('【症状推移】')
    lines.push(soapOutput.a.症状推移 || '（未入力）')
    lines.push('')
    lines.push('【リスク評価（自殺・他害・服薬）】')
    lines.push(soapOutput.a.リスク評価 || '（未入力）')
    lines.push('')
    lines.push('【背景要因】')
    lines.push(soapOutput.a.背景要因 || '（未入力）')
    lines.push('')
    lines.push('【次回観察ポイント】')
    lines.push(soapOutput.a.次回観察ポイント || '（未入力）')
    lines.push('')
    lines.push('P（計画）')
    lines.push('【本日実施した援助】')
    lines.push(soapOutput.p.本日実施した援助 || '（未入力）')
    lines.push('')
    lines.push('【次回以降の方針】')
    lines.push(soapOutput.p.次回以降の方針 || '（未入力）')
    lines.push('')

    // Plan section
    if (planOutput) {
      lines.push('')
      lines.push('訪問看護計画書')
      // lines.push('')
      // lines.push('【看護計画書】')
      lines.push('')
      lines.push('【長期目標】')
      lines.push(planOutput.長期目標 || '（未入力）')
      lines.push('')
      lines.push('【短期目標】')
      lines.push(planOutput.短期目標 || '（未入力）')
      lines.push('')
      lines.push('【看護援助の方針】')
      lines.push(planOutput.看護援助の方針 || '（未入力）')
      lines.push('')
    }

    // Visit info - use defaults if empty
    const defaults = getDefaultValues()
    const finalVisitDate = visitDate || defaults.visitDate
    const finalStartTime = startTime || defaults.startTime
    const finalEndTime = endTime || defaults.endTime
    const finalSelectedNurses = selectedNurses.length > 0 ? selectedNurses : defaults.selectedNurses
    const finalDiagnosis = diagnosis || defaults.diagnosis

    lines.push('【訪問情報】')
    if (finalVisitDate) {
      const date = new Date(finalVisitDate)
      const weekdays = ['日', '月', '火', '水', '木', '金', '土']
      const weekday = weekdays[date.getDay()]
      const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}（${weekday}）`
      lines.push(`訪問日：${formattedDate}`)
    }
    if (finalStartTime && finalEndTime) {
      lines.push(`訪問時間：${finalStartTime}〜${finalEndTime}`)
    }
    if (finalSelectedNurses.length > 0) {
      lines.push(`担当看護師：${finalSelectedNurses.join('・')}`)
    }
    if (finalDiagnosis) {
      lines.push(`主疾患：${finalDiagnosis}`)
    }

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

  const handleVoiceResultS = (text: string) => {
    setSText((prev) => prev + (prev ? '\n' : '') + text)
  }

  const handleVoiceResultO = (text: string) => {
    setOText((prev) => prev + (prev ? '\n' : '') + text)
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">入力情報</h2>

        {/* 利用者名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            利用者名
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder="利用者名を入力"
            disabled={loading}
          />
        </div>

        {/* 主疾患 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            主疾患
          </label>
          <select
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white"
            disabled={loading}
          >
            <option value="">選択してください</option>
            {DIAGNOSIS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* 看護師名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            看護師名
          </label>
          <div className="flex flex-wrap gap-3">
            {NURSE_OPTIONS.map((nurse) => (
              <label
                key={nurse}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedNurses.includes(nurse)}
                  onChange={() => toggleNurse(nurse)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="text-base text-gray-700">{nurse}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 訪問日 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            訪問日
          </label>
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            disabled={loading}
          />
        </div>

        {/* 訪問時間 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              訪問開始時間
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              訪問終了時間
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              disabled={loading}
            />
          </div>
        </div>

        {/* 主訴 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            主訴
          </label>
          <input
            type="text"
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder="主訴を入力"
            disabled={loading}
          />
        </div>

        {/* S（主観） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            S（主観）
          </label>
          <div className="relative">
            <textarea
              ref={sTextareaRef}
              value={sText}
              onChange={(e) => setSText(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none overflow-y-auto"
              style={{ maxHeight: `${MAX_TEXTAREA_HEIGHT}px` }}
              placeholder="S（任意）"
              rows={4}
              disabled={loading}
            />
            <div className="absolute bottom-3 right-3">
              <VoiceInputButton
                onResult={handleVoiceResultS}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* O（客観） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            O（客観）
          </label>
          <div className="relative">
            <textarea
              ref={oTextareaRef}
              value={oText}
              onChange={(e) => setOText(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none overflow-y-auto"
              style={{ maxHeight: `${MAX_TEXTAREA_HEIGHT}px` }}
              placeholder="O（任意）"
              rows={4}
              disabled={loading}
            />
            <div className="absolute bottom-3 right-3">
              <VoiceInputButton
                onResult={handleVoiceResultO}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !canSubmit}
          className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg font-medium text-base hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '生成中...' : '要約する（AI）'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={loading}
          className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-medium text-base hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        >
          入力をクリア
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Output Display */}
      {soapOutput && (() => {
        const defaults = getDefaultValues()
        return (
          <div ref={resultsRef} className="space-y-6">
            <SOAPOutput
              soapOutput={soapOutput}
              planOutput={planOutput}
              visitDate={visitDate || defaults.visitDate}
              startTime={startTime || defaults.startTime}
              endTime={endTime || defaults.endTime}
              selectedNurses={selectedNurses.length > 0 ? selectedNurses : defaults.selectedNurses}
              diagnosis={diagnosis || defaults.diagnosis}
            />

          <button
            type="button"
            onClick={handleCopy}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-medium text-base hover:bg-green-700 transition-colors"
          >
            {copyState === 'copied' ? '✓ コピーしました' : 'すべてをコピー'}
          </button>
          </div>
        )
      })()}
    </div>
  )
}

