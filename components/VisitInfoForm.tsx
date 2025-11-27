import { NURSE_OPTIONS, DIAGNOSIS_OPTIONS } from './types'

interface VisitInfoFormProps {
  visitDatetime: string
  selectedNurses: string[]
  diagnosis: string
  onVisitDatetimeChange: (value: string) => void
  onNurseToggle: (nurse: string) => void
  onDiagnosisChange: (value: string) => void
  disabled?: boolean
}

export default function VisitInfoForm({
  visitDatetime,
  selectedNurses,
  diagnosis,
  onVisitDatetimeChange,
  onNurseToggle,
  onDiagnosisChange,
  disabled,
}: VisitInfoFormProps) {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-4">
      <h2 className="text-base font-semibold text-gray-800 mb-3">1. 利用者情報入力</h2>

      <div>
        <label htmlFor="visit-datetime" className="block text-sm font-medium text-gray-800 mb-2">
          訪問日時
        </label>
        <input
          id="visit-datetime"
          type="datetime-local"
          value={visitDatetime}
          onChange={(e) => onVisitDatetimeChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">看護師名</label>
        <div className="flex flex-wrap gap-3">
          {NURSE_OPTIONS.map((nurse) => (
            <label key={nurse} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedNurses.includes(nurse)}
                onChange={() => onNurseToggle(nurse)}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{nurse}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-800 mb-2">
          主疾患
        </label>
        <select
          id="diagnosis"
          value={diagnosis}
          onChange={(e) => onDiagnosisChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          disabled={disabled}
        >
          <option value="">選択してください</option>
          {DIAGNOSIS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

