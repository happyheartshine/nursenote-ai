import { RefObject } from 'react'
import TextareaWithVoice from './TextareaWithVoice'

interface InputFieldsProps {
  chiefComplaint: string
  sInput: string
  oInput: string
  onChiefComplaintChange: (value: string) => void
  onSInputChange: (value: string) => void
  onOInputChange: (value: string) => void
  chiefComplaintRef: RefObject<HTMLTextAreaElement>
  sInputRef: RefObject<HTMLTextAreaElement>
  oInputRef: RefObject<HTMLTextAreaElement>
  disabled?: boolean
}

export default function InputFields({
  chiefComplaint,
  sInput,
  oInput,
  onChiefComplaintChange,
  onSInputChange,
  onOInputChange,
  chiefComplaintRef,
  sInputRef,
  oInputRef,
  disabled,
}: InputFieldsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-800 mb-3">2. 入力欄</h2>

      <TextareaWithVoice
        id="chief-complaint"
        label="主訴（短文）"
        value={chiefComplaint}
        onChange={onChiefComplaintChange}
        placeholder="主訴（短文で入力してください）"
        textareaRef={chiefComplaintRef}
        disabled={disabled}
        minHeight="60px"
        rows={1}
        onVoiceResult={(text) => onChiefComplaintChange(chiefComplaint + (chiefComplaint ? ' ' : '') + text)}
      />

      <TextareaWithVoice
        id="soap-s"
        label="S（主観的）"
        value={sInput}
        onChange={onSInputChange}
        placeholder="S（任意）"
        textareaRef={sInputRef}
        disabled={disabled}
        minHeight="140px"
        maxHeight="300px"
        rows={4}
        onVoiceResult={(text) => onSInputChange(sInput + (sInput ? '\n' : '') + text)}
      />

      <TextareaWithVoice
        id="soap-o"
        label="O（客観的）"
        value={oInput}
        onChange={onOInputChange}
        placeholder="O（任意）"
        textareaRef={oInputRef}
        disabled={disabled}
        minHeight="140px"
        maxHeight="300px"
        rows={4}
        onVoiceResult={(text) => onOInputChange(oInput + (oInput ? '\n' : '') + text)}
      />
    </div>
  )
}

