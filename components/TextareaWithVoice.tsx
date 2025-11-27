import { RefObject } from 'react'
import VoiceInputButton from './VoiceInputButton'

interface TextareaWithVoiceProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  textareaRef: RefObject<HTMLTextAreaElement>
  disabled?: boolean
  minHeight?: string
  maxHeight?: string
  rows?: number
  onVoiceResult: (text: string) => void
}

export default function TextareaWithVoice({
  id,
  label,
  value,
  onChange,
  placeholder,
  textareaRef,
  disabled,
  minHeight = '60px',
  maxHeight,
  rows = 1,
  onVoiceResult,
}: TextareaWithVoiceProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-800 mb-2">
        {label}
      </label>
      <div className="relative flex items-start">
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ 
            minHeight,
            ...(maxHeight && { maxHeight, overflowY: 'auto' })
          }}
          className="flex-1 resize-none rounded-lg border border-gray-300 p-4 pr-12 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          disabled={disabled}
          rows={rows}
        />
        <div className="absolute right-2 top-2">
          <VoiceInputButton onResult={onVoiceResult} disabled={disabled} />
        </div>
      </div>
    </div>
  )
}

