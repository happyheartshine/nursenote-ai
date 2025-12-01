'use client'

import { SoapOutput, PlanOutput } from './types'

interface SOAPOutputProps {
  soapOutput: SoapOutput
  planOutput?: PlanOutput | null
  visitDate: string
  startTime: string
  endTime: string
  selectedNurses: string[]
  diagnosis: string
}

export default function SOAPOutput({
  soapOutput,
  planOutput,
  visitDate,
  startTime,
  endTime,
  selectedNurses,
  diagnosis,
}: SOAPOutputProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    const weekday = weekdays[date.getDay()]
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}（${weekday}）`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* S */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">S（主観）</h3>
        <div className="space-y-2">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
            {soapOutput.s || '（未入力）'}
          </p>
        </div>
      </div>

      {/* O */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">O（客観）</h3>
        <div className="space-y-2">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
            {soapOutput.o || '（未入力）'}
          </p>
        </div>
      </div>

      {/* A */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">A（アセスメント）</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">【症状推移】</h4>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
              {soapOutput.a.症状推移 || '（未入力）'}
            </p>
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">
              【リスク評価（自殺・他害・服薬）】
            </h4>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
              {soapOutput.a.リスク評価 || '（未入力）'}
            </p>
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">【背景要因】</h4>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
              {soapOutput.a.背景要因 || '（未入力）'}
            </p>
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">【次回観察ポイント】</h4>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
              {soapOutput.a.次回観察ポイント || '（未入力）'}
            </p>
          </div>
        </div>
      </div>

      {/* P */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">P（計画）</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">【本日実施した援助】</h4>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
              {soapOutput.p.本日実施した援助 || '（未入力）'}
            </p>
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">【次回以降の方針】</h4>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
              {soapOutput.p.次回以降の方針 || '（未入力）'}
            </p>
          </div>
        </div>
      </div>

      {/* 訪問看護計画書 */}
      {planOutput && (
        <div className="border-t border-gray-300 pt-6 mt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">訪問看護計画書</h3>
          <div className="space-y-4">
            <div>
              {/* <h4 className="text-base font-semibold text-gray-800 mb-2">【看護計画書】</h4> */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-2">【長期目標】</h4>
                  {/* <h5 className="text-sm font-medium text-gray-700 mb-2">長期目標：</h5> */}
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                    {planOutput.長期目標 || '（未入力）'}
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-2">【短期目標】</h4>
                  {/* <h5 className="text-sm font-medium text-gray-700 mb-2">短期目標：</h5> */}
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                    {planOutput.短期目標 || '（未入力）'}
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-800 mb-2">【看護援助の方針】</h4>
                  {/* <h5 className="text-sm font-medium text-gray-700 mb-2">看護援助の方針：</h5> */}
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                    {planOutput.看護援助の方針 || '（未入力）'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 訪問情報 */}
      <div className="border-t border-gray-300 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">【訪問情報】</h3>
        <div className="space-y-2">
          {visitDate && (
            <p className="text-base text-gray-700">
              訪問日：{formatDate(visitDate)}
            </p>
          )}
          {startTime && endTime && (
            <p className="text-base text-gray-700">
              訪問時間：{startTime}〜{endTime}
            </p>
          )}
          {selectedNurses.length > 0 && (
            <p className="text-base text-gray-700">
              担当看護師：{selectedNurses.join('・')}
            </p>
          )}
          {diagnosis && (
            <p className="text-base text-gray-700">
              主疾患：{diagnosis}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

