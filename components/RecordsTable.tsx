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

export default function RecordsTable() {
  return (
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
  )
}

