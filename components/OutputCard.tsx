interface OutputCardProps {
  title: string
  content: string
  onCopy?: () => void
  showCopyButton?: boolean
}

export default function OutputCard({ 
  title, 
  content, 
  onCopy, 
  showCopyButton = false 
}: OutputCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
        {content || '（出力待ち）'}
      </div>
      {showCopyButton && onCopy && (
        <button
          onClick={onCopy}
          className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          コピー
        </button>
      )}
    </div>
  )
}

