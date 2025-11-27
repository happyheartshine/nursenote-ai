import { useEffect, useRef } from 'react'

/**
 * Hook to auto-resize a textarea based on its content.
 * @param value - The current value of the textarea
 * @returns Ref to attach to the textarea element
 */
export function useAutoResizeTextarea(value: string) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to auto to get the correct scrollHeight
    const currentHeight = textarea.style.height
    textarea.style.height = 'auto'
    
    // Calculate new height based on scrollHeight, but ensure minimum height
    const scrollHeight = textarea.scrollHeight
    const minHeight = parseInt(getComputedStyle(textarea).minHeight) || 0
    const newHeight = Math.max(scrollHeight, minHeight)
    
    textarea.style.height = `${newHeight}px`
    textarea.style.overflowY = scrollHeight > newHeight ? 'auto' : 'hidden'
  }, [value])

  return textareaRef
}

