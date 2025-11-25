interface OutputCardProps {
  title?: string
  content: string
  className?: string
}

export default function OutputCard({ title, content, className = '' }: OutputCardProps) {
  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      {title && <h3 className="text-base font-semibold mb-3 text-gray-800">{title}</h3>}
      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
        {content?.trim() ? content : '（出力待ち）'}
      </div>
    </div>
  )
}

