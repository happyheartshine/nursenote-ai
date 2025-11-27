export type TabKey = 'soap' | 'plan' | 'records'

export interface StructuredA {
  症状推移: string
  リスク評価: string
  背景要因: string
  次回観察ポイント: string
}

export interface StructuredP {
  本日実施した援助: string
  次回以降の方針: string
}

export interface SoapOutput {
  s: string
  o: string
  a: StructuredA
  p: StructuredP
}

export interface PlanOutput {
  長期目標: string
  短期目標: string
  看護援助の方針: string
}

export interface VisitInfo {
  visit_datetime: string
  nurses: string[]
  diagnosis: string
}

export const TABS: { key: TabKey; label: string }[] = [
  { key: 'soap', label: 'SOAP作成' },
  { key: 'plan', label: '訪問看護計画書' },
  { key: 'records', label: '記録一覧（準備中）' },
]

export const NURSE_OPTIONS = ['吉村', 'A子', 'B子']
export const DIAGNOSIS_OPTIONS = ['統合失調症', '双極性障害', 'うつ病', 'その他']

