import { SoapOutput } from './types'
import OutputCard from './OutputCard'

interface SOAPResultsProps {
  soapOutput: SoapOutput
}

export default function SOAPResults({ soapOutput }: SOAPResultsProps) {
  return (
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
  )
}

