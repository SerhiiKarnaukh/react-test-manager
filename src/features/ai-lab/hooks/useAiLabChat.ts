import { useMutation } from '@tanstack/react-query'
import { useAlertStore } from '@core/alert/alert.store'
import { deleteVisionImage, sendChatMessage, uploadVisionImages } from '@features/ai-lab/api/chat'
import {
  extractFilenameFromUrl,
  resolveAiLabApiErrorMessage,
} from '@features/ai-lab/api/ai-lab.models'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'

function useAiLabErrorAlert() {
  const enqueue = useAlertStore((s) => s.enqueue)

  return (error: unknown, fallback: string) => {
    const apiMessage = resolveAiLabApiErrorMessage(error)
    enqueue('error', apiMessage ?? fallback)
  }
}

export function useSendChatMessage() {
  const setMessage = useAiLabStore((s) => s.setMessage)
  const promptImages = useAiLabStore((s) => s.promptImages)
  const showError = useAiLabErrorAlert()

  return useMutation({
    mutationFn: (question: string) => sendChatMessage(question, promptImages),
    onSuccess: (response) => {
      setMessage(response.message)
    },
    onError: (error) => {
      showError(error, 'Failed to send chat message')
    },
  })
}

export function useUploadPromptImages() {
  const addPromptImages = useAiLabStore((s) => s.addPromptImages)
  const setUploadingImages = useAiLabStore((s) => s.setUploadingImages)
  const showError = useAiLabErrorAlert()

  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData()
      files.forEach((file) => formData.append('images[]', file))
      return uploadVisionImages(formData)
    },
    onMutate: () => {
      setUploadingImages(true)
    },
    onSuccess: (response) => {
      addPromptImages(response.uploaded_images)
    },
    onError: (error) => {
      showError(error, 'Failed to upload images')
    },
    onSettled: () => {
      setUploadingImages(false)
    },
  })
}

export function useDeletePromptImage() {
  const removePromptImageAt = useAiLabStore((s) => s.removePromptImageAt)
  const showError = useAiLabErrorAlert()

  return useMutation({
    mutationFn: async ({ index, imageUrl }: { index: number; imageUrl: string }) => {
      const filename = extractFilenameFromUrl(imageUrl)
      await deleteVisionImage(filename)
      return index
    },
    onSuccess: (index) => {
      if (index !== undefined) {
        removePromptImageAt(index)
      }
    },
    onError: (error) => {
      showError(error, 'Failed to delete image')
    },
  })
}
