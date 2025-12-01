'use client'

import { useState, useRef, useMemo } from 'react'
import TabNavigation from './TabNavigation'
import SOAPTab from './SOAPTab'
import PlanTab from './PlanTab'
import RecordsTab from './RecordsTab'

export type TabKey = 'soap' | 'plan' | 'records'

export default function HomePageClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('soap')

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            精神科訪問看護 記録支援
          </h1>
          <p className="text-sm text-gray-600 text-center mt-1">NurseNote AI</p>
        </header>

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'soap' && <SOAPTab />}
        {activeTab === 'plan' && <PlanTab />}
        {activeTab === 'records' && <RecordsTab />}
      </main>
    </div>
  )
}
