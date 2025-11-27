import { PlanOutput } from './types'
import OutputCard from './OutputCard'

interface PlanResultsProps {
  planOutput: PlanOutput
}

export default function PlanResults({ planOutput }: PlanResultsProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-3">【看護計画書】</h2>
      <div className="space-y-3">
        <OutputCard title="長期目標" content={planOutput.長期目標} />
        <OutputCard title="短期目標" content={planOutput.短期目標} />
        <OutputCard title="看護援助の方針" content={planOutput.看護援助の方針} />
      </div>
    </div>
  )
}

