'use client'

import { useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import TabNavigation from './TabNavigation'
import SOAPTab from './SOAPTab'
import PlanTab from './PlanTab'
import RecordsTab from './RecordsTab'

export type TabKey = 'soap' | 'plan' | 'records'

export default function HomePageClient() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>('soap')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                精神科訪問看護 記録支援
              </h1>
              <p className="text-sm text-gray-600 mt-1">NurseNote AI</p>
            </div>
            <div className="flex-1 flex justify-end">
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </header>

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'soap' && <SOAPTab />}
        {activeTab === 'plan' && <PlanTab />}
        {activeTab === 'records' && <RecordsTab />}
      </main>
    </div>
  )
}
