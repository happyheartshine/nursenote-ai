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
      {isListening ? '⏹️' : '🎤'}
    </button>
  )
}

