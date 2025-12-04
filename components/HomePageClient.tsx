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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmOWZhZmIiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">
        <header className="mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1"></div>
              <div className="flex-1 text-center">
                
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  精神科訪問看護 記録支援
                </h1>
                <p className="text-sm text-gray-500 mt-2 font-medium">NurseNote AI</p>
              </div>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200 font-medium border border-gray-200/50 hover:border-gray-300 hover:shadow-sm"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </header>

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === 'soap' && <SOAPTab />}
          {activeTab === 'plan' && <PlanTab />}
          {activeTab === 'records' && <RecordsTab />}
        </div>
      </main>
    </div>
  )
}
