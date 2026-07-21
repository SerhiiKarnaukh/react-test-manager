import { useMutation } from '@tanstack/react-query'
import { useAlertStore } from '@core/alert/alert.store'
import { generateVoice } from '@features/ai-lab/api/voice'
import { resolveAiLabApiErrorMessage } from '@features/ai-lab/api/ai-lab.models'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'

export function useGenerateVoice() {
  const setVoiceMessage = useAiLabStore((s) => s.setVoiceMessage)
  const enqueue = useAlertStore((s) => s.enqueue)

  return useMutation({
    mutationFn: generateVoice,
    onSuccess: (response) => {
      setVoiceMessage(response.message)
    },
    onError: (error) => {
      const apiMessage = resolveAiLabApiErrorMessage(error)
      enqueue('error', apiMessage ?? 'Failed to generate voice')
    },
  })
}
