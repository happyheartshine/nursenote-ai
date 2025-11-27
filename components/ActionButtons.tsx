import LoadingSpinner from './LoadingSpinner'

interface ActionButtonsProps {
  onGenerate: () => void
  onClear: () => void
  loading: boolean
  canSubmit: boolean
  generateLabel: string
}

export default function ActionButtons({
  onGenerate,
  onClear,
  loading,
  canSubmit,
  generateLabel,
}: ActionButtonsProps) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onGenerate}
        disabled={loading || !canSubmit}
        className="flex-1 sm:basis-[60%] rounded-lg bg-blue-600 py-3 text-lg font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {loading ? <LoadingSpinner /> : generateLabel}
      </button>
      <button
        type="button"
        onClick={onClear}
        disabled={loading}
        className="flex-1 sm:basis-[40%] rounded-lg border border-gray-300 bg-white py-3 text-lg font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed"
      >
        入力をクリア
      </button>
    </div>
  )
}

