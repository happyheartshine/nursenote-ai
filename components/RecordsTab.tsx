'use client'

const PLACEHOLDER_RECORDS = [
  { date: '2025/02/02', userName: '利用者A', complaint: '不安強め' },
  { date: '2025/01/28', userName: '利用者A', complaint: '睡眠不良' },
  { date: '2025/01/20', userName: '利用者A', complaint: '安定傾向' },
]

export default function RecordsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900">記録一覧</h2>
        </div>

        <div className="space-y-3">
          {PLACEHOLDER_RECORDS.map((record, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:bg-blue-600 transition-colors"></div>
                    <p className="text-sm font-semibold text-gray-900">
                      {record.date}　{record.userName}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 ml-4">主訴：{record.complaint}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

