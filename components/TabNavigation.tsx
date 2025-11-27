import { TABS, TabKey } from './types'

interface TabNavigationProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-2 mb-6" role="tablist" aria-label="アプリケーションタブ">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-50 border-blue-500 text-blue-600'
                : 'bg-gray-100 border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

