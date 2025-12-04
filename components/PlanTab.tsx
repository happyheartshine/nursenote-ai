'use client'

export default function PlanTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900">訪問看護計画書（案）</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              主疾患
            </label>
            <select
              disabled
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-gray-100/80 text-gray-500 cursor-not-allowed shadow-sm"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-gray-100/80 text-gray-500 cursor-not-allowed shadow-sm"
              placeholder="利用者名を入力"
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50/80 to-slate-50/80 border border-gray-200/50 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              長期目標
            </h3>
            <p className="text-sm text-gray-400">（準備中）</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              短期目標
            </h3>
            <p className="text-sm text-gray-400">（準備中）</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              看護援助の方針
            </h3>
            <p className="text-sm text-gray-400">（準備中）</p>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="w-full bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 py-4 px-6 rounded-xl font-semibold text-base cursor-not-allowed shadow-md"
        >
          計画書生成
        </button>
      </div>
    </div>
  )
}

