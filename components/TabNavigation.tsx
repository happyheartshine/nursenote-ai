'use client'

import { TabKey } from './HomePageClient'

interface TabNavigationProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'soap', label: 'SOAP作成（AI生成）' },
  { key: 'plan', label: '訪問看護計画書（案）' },
  { key: 'records', label: '記録一覧' },
]

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-2 mb-6">
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`relative flex-1 px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
              activeTab === tab.key
                ? 'text-white shadow-lg transform scale-[1.02]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
            }`}
            style={
              activeTab === tab.key
                ? {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                  }
                : {}
            }
          >
            <span className="relative z-10">{tab.label}</span>
            {activeTab === tab.key && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 opacity-90 animate-pulse"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
