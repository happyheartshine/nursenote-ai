'use client'

export default function PlanTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">訪問看護計画書（案）</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              主疾患
            </label>
            <select
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-gray-100 text-gray-500 cursor-not-allowed"
            >
              <option value="">選択してください</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              利用者名
            </label>
            <input
              type="text"
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-gray-100 text-gray-500 cursor-not-allowed"
              placeholder="利用者名を入力"
            />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">長期目標</h3>
            <p className="text-sm text-gray-400">（準備中）</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">短期目標</h3>
            <p className="text-sm text-gray-400">（準備中）</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">看護援助の方針</h3>
            <p className="text-sm text-gray-400">（準備中）</p>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="w-full bg-gray-300 text-gray-500 py-4 px-6 rounded-lg font-medium text-base cursor-not-allowed"
        >
          計画書生成
        </button>
      </div>
    </div>
  )
}

