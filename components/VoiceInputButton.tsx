'use client'

import { useState, useRef, useEffect } from 'react'

interface VoiceInputButtonProps {
  onResult: (text: string) => void
  disabled?: boolean
}

export default function VoiceInputButton({ onResult, disabled }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'ja-JP'
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      if (transcript.trim()) {
        onResult(transcript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onResult])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('お使いのブラウザは音声認識に対応していません')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err) {
        console.error('Failed to start recognition:', err)
        setIsListening(false)
      }
    }
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      className={`p-2 rounded-full transition-colors ${
        isListening
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isListening ? '音声認識を停止' : '音声入力'}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    </button>
  )
}
