import { VisitInfo } from './types'

interface VisitInfoDisplayProps {
  visitInfo: VisitInfo
}

export default function VisitInfoDisplay({ visitInfo }: VisitInfoDisplayProps) {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-800 mb-2">訪問情報</h3>
      <div className="space-y-1 text-sm text-gray-700">
        {visitInfo.visit_datetime && (
          <p>訪問日時: {new Date(visitInfo.visit_datetime).toLocaleString('ja-JP')}</p>
        )}
        {visitInfo.nurses.length > 0 && (
          <p>本日の訪問担当: {visitInfo.nurses.join('・')}</p>
        )}
        {visitInfo.diagnosis && <p>主疾患: {visitInfo.diagnosis}</p>}
      </div>
    </div>
  )
}

