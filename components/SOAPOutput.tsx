'use client'

import { useState } from 'react'
import { SoapOutput, PlanOutput } from './types'

interface SOAPOutputProps {
  soapOutput: SoapOutput
  planOutput?: PlanOutput | null
  visitDate: string
  startTime: string
  endTime: string
  selectedNurses: string[]
  diagnosis: string
  onSoapUpdate?: (updated: SoapOutput) => void
  onPlanUpdate?: (updated: PlanOutput) => void
}

export default function SOAPOutput({
  soapOutput,
  planOutput,
  visitDate,
  startTime,
  endTime,
  selectedNurses,
  diagnosis,
  onSoapUpdate,
  onPlanUpdate,
}: SOAPOutputProps) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    const weekday = weekdays[date.getDay()]
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}（${weekday}）`
  }

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field)
    setEditValue(currentValue || '')
  }

  const handleSave = () => {
    if (!editingField) return

    if (editingField === 's' || editingField === 'o') {
      // Update S or O
      const updated: SoapOutput = {
        ...soapOutput,
        [editingField]: editValue,
      }
      onSoapUpdate?.(updated)
    } else if (editingField.startsWith('a.')) {
      // Update A sub-field
      const subField = editingField.replace('a.', '') as keyof typeof soapOutput.a
      const updated: SoapOutput = {
        ...soapOutput,
        a: {
          ...soapOutput.a,
          [subField]: editValue,
        },
      }
      onSoapUpdate?.(updated)
    } else if (editingField.startsWith('p.')) {
      // Update P sub-field
      const subField = editingField.replace('p.', '') as keyof typeof soapOutput.p
      const updated: SoapOutput = {
        ...soapOutput,
        p: {
          ...soapOutput.p,
          [subField]: editValue,
        },
      }
      onSoapUpdate?.(updated)
    } else if (editingField.startsWith('plan.')) {
      // Update Plan field
      if (!planOutput) return
      const subField = editingField.replace('plan.', '') as keyof PlanOutput
      const updated: PlanOutput = {
        ...planOutput,
        [subField]: editValue,
      }
      onPlanUpdate?.(updated)
    }

    setEditingField(null)
    setEditValue('')
  }

  const handleCancel = () => {
    setEditingField(null)
    setEditValue('')
  }

  const EditableContent = ({
    field,
    value,
    className = '',
  }: {
    field: string
    value: string
    className?: string
  }) => {
    const isEditing = editingField === field
    const displayValue = value || '（未入力）'

    if (isEditing) {
      return (
        <div className="space-y-2">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-[15px] font-normal resize-y min-h-[100px] ${className}`}
            rows={4}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="relative">
        <p className={`text-gray-800 whitespace-pre-wrap leading-7 text-[15px] font-normal pr-7 ${className}`}>
          {displayValue}
        </p>
        <button
          onClick={() => handleEdit(field, value)}
          className="absolute bottom-1 right-1 p-1"
          title="編集"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 space-y-8">
      {/* S */}
      <div className="pb-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">
          <span className="inline-block w-10 h-10 rounded-lg bg-blue-50 text-blue-700 font-bold text-lg mr-3 text-center leading-10">S</span>
          <span className="text-gray-600 font-medium text-base">主観</span>
        </h3>
        <div className="ml-[52px] mt-3">
          <EditableContent field="s" value={soapOutput.s} />
        </div>
      </div>

      {/* O */}
      <div className="pb-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">
          <span className="inline-block w-10 h-10 rounded-lg bg-green-50 text-green-700 font-bold text-lg mr-3 text-center leading-10">O</span>
          <span className="text-gray-600 font-medium text-base">客観</span>
        </h3>
        <div className="ml-[52px] mt-3">
          <EditableContent field="o" value={soapOutput.o} />
        </div>
      </div>

      {/* A */}
      <div className="pb-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-5 tracking-tight">
          <span className="inline-block w-10 h-10 rounded-lg bg-amber-50 text-amber-700 font-bold text-lg mr-3 text-center leading-10">A</span>
          <span className="text-gray-600 font-medium text-base">アセスメント</span>
        </h3>
        <div className="ml-13 space-y-5">
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-amber-200">
            <h4 className="text-[15px] font-semibold text-gray-900 mb-3 tracking-wide">【症状推移】</h4>
            <EditableContent field="a.症状推移" value={soapOutput.a.症状推移} />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-200">
            <h4 className="text-[15px] font-semibold text-gray-900 mb-3 tracking-wide">
              【リスク評価（自殺・他害・服薬）】
            </h4>
            <EditableContent field="a.リスク評価" value={soapOutput.a.リスク評価} />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-200">
            <h4 className="text-[15px] font-semibold text-gray-900 mb-3 tracking-wide">【背景要因】</h4>
            <EditableContent field="a.背景要因" value={soapOutput.a.背景要因} />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-200">
            <h4 className="text-[15px] font-semibold text-gray-900 mb-3 tracking-wide">【次回観察ポイント】</h4>
            <EditableContent field="a.次回観察ポイント" value={soapOutput.a.次回観察ポイント} />
          </div>
        </div>
      </div>

      {/* P */}
      <div className="pb-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-5 tracking-tight">
          <span className="inline-block w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-lg mr-3 text-center leading-10">P</span>
          <span className="text-gray-600 font-medium text-base">計画</span>
        </h3>
        <div className="ml-13 space-y-5">
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-200">
            <h4 className="text-[15px] font-semibold text-gray-900 mb-3 tracking-wide">【本日実施した援助】</h4>
            <EditableContent field="p.本日実施した援助" value={soapOutput.p.本日実施した援助} />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-teal-200">
            <h4 className="text-[15px] font-semibold text-gray-900 mb-3 tracking-wide">【次回以降の方針】</h4>
            <EditableContent field="p.次回以降の方針" value={soapOutput.p.次回以降の方針} />
          </div>
        </div>
      </div>

      {/* 訪問看護計画書 */}
      {planOutput && (
        <div className="border-t-2 border-gray-200 pt-8 mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight flex items-center">
            <span className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></span>
            訪問看護計画書
          </h3>
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
              <h4 className="text-[15px] font-semibold text-indigo-900 mb-3 tracking-wide flex items-center">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                【長期目標】
              </h4>
              <div className="ml-4">
                <EditableContent field="plan.長期目標" value={planOutput.長期目標} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-100">
              <h4 className="text-[15px] font-semibold text-teal-900 mb-3 tracking-wide flex items-center">
                <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                【短期目標】
              </h4>
              <div className="ml-4">
                <EditableContent field="plan.短期目標" value={planOutput.短期目標} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
              <h4 className="text-[15px] font-semibold text-amber-900 mb-3 tracking-wide flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                【看護援助の方針】
              </h4>
              <div className="ml-4">
                <EditableContent field="plan.看護援助の方針" value={planOutput.看護援助の方針} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 訪問情報 */}
      <div className="border-t-2 border-gray-200 pt-8 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">【訪問情報】</h3>
        <div className="bg-gray-50 rounded-lg p-5 space-y-3 border border-gray-200">
          {visitDate && (
            <div className="flex items-start">
              <span className="text-gray-500 font-medium text-sm min-w-[100px]">訪問日</span>
              <span className="text-gray-700 font-normal text-[15px]">：</span>
              <span className="text-gray-800 font-medium text-[15px] ml-2">{formatDate(visitDate)}</span>
            </div>
          )}
          {startTime && endTime && (
            <div className="flex items-start">
              <span className="text-gray-500 font-medium text-sm min-w-[100px]">訪問時間</span>
              <span className="text-gray-700 font-normal text-[15px]">：</span>
              <span className="text-gray-800 font-medium text-[15px] ml-2">{startTime}〜{endTime}</span>
            </div>
          )}
          {selectedNurses.length > 0 && (
            <div className="flex items-start">
              <span className="text-gray-500 font-medium text-sm min-w-[100px]">担当看護師</span>
              <span className="text-gray-700 font-normal text-[15px]">：</span>
              <span className="text-gray-800 font-medium text-[15px] ml-2">{selectedNurses.join('・')}</span>
            </div>
          )}
          {diagnosis && (
            <div className="flex items-start">
              <span className="text-gray-500 font-medium text-sm min-w-[100px]">主疾患</span>
              <span className="text-gray-700 font-normal text-[15px]">：</span>
              <span className="text-gray-800 font-medium text-[15px] ml-2">{diagnosis}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

