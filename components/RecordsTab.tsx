'use client'

const PLACEHOLDER_RECORDS = [
  { date: '2025/02/02', userName: '利用者A', complaint: '不安強め' },
  { date: '2025/01/28', userName: '利用者A', complaint: '睡眠不良' },
  { date: '2025/01/20', userName: '利用者A', complaint: '安定傾向' },
]

export default function RecordsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">記録一覧</h2>

        <div className="space-y-3">
          {PLACEHOLDER_RECORDS.map((record, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {record.date}　{record.userName}
                  </p>
                  <p className="text-sm text-gray-600">主訴：{record.complaint}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

