'use client'

import { useState, useEffect } from 'react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

interface VoiceInputButtonProps {
  onResult: (text: string) => void
  disabled?: boolean
}

export default function VoiceInputButton({ onResult, disabled }: VoiceInputButtonProps) {
  const [mounted, setMounted] = useState(false)
  const { isListening, startListening, stopListening } = useSpeechRecognition(onResult)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClick = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Don't render on server to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  const isSupported =
    typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  if (!isSupported) {
    return null
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`rounded-full p-2 transition-colors ${
        isListening
          ? 'bg-red-100 text-red-600'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isListening ? '音声入力を停止' : '音声入力'}
    >
      {isListening ? (
        <svg
          enableBackground="new 0 0 24 24"
          focusable="false"
          height="24"
          viewBox="0 0 24 24"
          width="24"
          className="fill-current"
          aria-hidden="true"
        >
          <g>
            <rect fill="none" height="24" width="24"></rect>
          </g>
          <g>
            <g>
              <path d="M6,6h12v12H6V6z"></path>
            </g>
          </g>
        </svg>
      ) : (
        <svg
          focusable="false"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="fill-current"
          aria-hidden="true"
        >
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"></path>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"></path>
        </svg>
      )}
    </button>
  )
}

