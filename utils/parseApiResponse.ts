import { SoapOutput, PlanOutput } from '@/components/types'

// Parse API response into structured format
export function parseApiResponse(text: string): { soap: SoapOutput; plan: PlanOutput } {
  const initialSoap: SoapOutput = {
    s: '',
    o: '',
    a: {
      症状推移: '',
      リスク評価: '',
      背景要因: '',
      次回観察ポイント: '',
    },
    p: {
      本日実施した援助: '',
      次回以降の方針: '',
    },
  }

  const initialPlan: PlanOutput = {
    長期目標: '',
    短期目標: '',
    看護援助の方針: '',
  }

  if (!text) {
    return { soap: initialSoap, plan: initialPlan }
  }

  const normalized = text.replace(/\r\n/g, '\n').trim()

  // Split SOAP and Plan sections
  const planMarker = '【看護計画書】'
  let soapText = normalized
  let planText = ''

  if (normalized.includes(planMarker)) {
    const markerIndex = normalized.indexOf(planMarker)
    soapText = normalized.slice(0, markerIndex).trim()
    planText = normalized.slice(markerIndex + planMarker.length).trim()
  }

  // Parse S
  const sMatch = soapText.match(/S[（(]主観[）)]\s*[:：]?\s*\n?([\s\S]+?)(?=\n\s*O[（(]客観[）)]|$)/)
  if (sMatch) {
    initialSoap.s = sMatch[1].trim()
  }

  // Parse O
  const oMatch = soapText.match(/O[（(]客観[）)]\s*[:：]?\s*\n?([\s\S]+?)(?=\n\s*A[（(]アセスメント[）)]|$)/)
  if (oMatch) {
    initialSoap.o = oMatch[1].trim()
  }

  // Parse A with sub-sections
  const aMatch = soapText.match(/A[（(]アセスメント[）)]\s*[:：]?\s*\n?([\s\S]+?)(?=\n\s*P[（(]計画[）)]|$)/)
  if (aMatch) {
    const aContent = aMatch[1]

    // Extract sub-sections
    const symptomMatch = aContent.match(/症状推移\s*[:：]?\s*\n?([\s\S]+?)(?=\n\s*[・•]\s*リスク評価|$)/)
    if (symptomMatch) {
      initialSoap.a.症状推移 = symptomMatch[1].trim()
    }

    const riskMatch = aContent.match(/リスク評価[（(]自殺[・・]他害[・・]服薬[）)]\s*[:：]?\s*\n?([\s\S]+?)(?=\n\s*[・•]\s*背景要因|$)/)
    if (riskMatch) {
      initialSoap.a.リスク評価 = riskMatch[1].trim()
    }

    const backgroundMatch = aContent.match(/背景要因\s*[:：]?\s*\n?([\s\S]+?)(?=\n\s*[・•]\s*次回観察ポイント|$)/)
    if (backgroundMatch) {
      initialSoap.a.背景要因 = backgroundMatch[1].trim()
    }

    const observationMatch = aContent.match(/次回観察ポイント\s*[:：]?\s*\n?([\s\S]+?)(?=\n\s*P[（(]計画[）)]|$)/)
    if (observationMatch) {
      initialSoap.a.次回観察ポイント = observationMatch[1].trim()
    }

    // Fallback: if structured parsing fails, put all content in 症状推移
    if (!Object.values(initialSoap.a).some((v) => v)) {
      initialSoap.a.症状推移 = aContent.trim()
    }
  }

  // Parse P with sub-sections
  const pMatch = soapText.match(/P[（(]計画[）)]\s*[:：]?\s*\n?([\s\S]+?)(?=\n\s*【看護計画書】|$)/)
  if (pMatch) {
    const pContent = pMatch[1]

    const todayMatch = pContent.match(/本日実施した援助\s*[:：]?\s*\n?([\s\S]+?)(?=\n\s*次回以降の方針|$)/)
    if (todayMatch) {
      initialSoap.p.本日実施した援助 = todayMatch[1].trim()
    }

    const futureMatch = pContent.match(/次回以降の方針\s*[:：]?\s*\n?([\s\S]+?)(?=\n\s*【看護計画書】|$)/)
    if (futureMatch) {
      initialSoap.p.次回以降の方針 = futureMatch[1].trim()
    }

    // Fallback: if structured parsing fails, put all content in 本日実施した援助
    if (!Object.values(initialSoap.p).some((v) => v)) {
      initialSoap.p.本日実施した援助 = pContent.trim()
    }
  }

  // Parse Plan sections
  const longTermMatch = planText.match(/長期目標\s*[:：]?\s*\n?([\s\S]+?)(?=\n\s*短期目標|$)/)
  if (longTermMatch) {
    initialPlan.長期目標 = longTermMatch[1].trim()
  }

  const shortTermMatch = planText.match(/短期目標\s*[:：]?\s*\n?([\s\S]+?)(?=\n\s*看護援助の方針|$)/)
  if (shortTermMatch) {
    initialPlan.短期目標 = shortTermMatch[1].trim()
  }

  const policyMatch = planText.match(/看護援助の方針\s*[:：]?\s*\n?([\s\S]+?)$/)
  if (policyMatch) {
    initialPlan.看護援助の方針 = policyMatch[1].trim()
  }

  return { soap: initialSoap, plan: initialPlan }
}

