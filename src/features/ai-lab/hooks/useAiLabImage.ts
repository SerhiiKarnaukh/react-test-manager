import { useMutation } from '@tanstack/react-query'
import { useAlertStore } from '@core/alert/alert.store'
import { downloadImage, generateImage } from '@features/ai-lab/api/image'
import { extractFilenameFromUrl, resolveAiLabApiErrorMessage } from '@features/ai-lab/api/ai-lab.models'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function useGenerateImage() {
  const setImageUrl = useAiLabStore((s) => s.setImageUrl)
  const enqueue = useAlertStore((s) => s.enqueue)

  return useMutation({
    mutationFn: generateImage,
    onSuccess: (response) => {
      setImageUrl(response.message)
    },
    onError: (error) => {
      const apiMessage = resolveAiLabApiErrorMessage(error)
      enqueue('error', apiMessage ?? 'Failed to generate image')
    },
  })
}

export function useDownloadGeneratedImage() {
  const enqueue = useAlertStore((s) => s.enqueue)

  return useMutation({
    mutationFn: async (imageUrl: string) => {
      const filename = extractFilenameFromUrl(imageUrl)
      const blob = await downloadImage(filename)
      triggerBlobDownload(blob, filename)
    },
    onError: (error) => {
      const apiMessage = resolveAiLabApiErrorMessage(error)
      enqueue('error', apiMessage ?? 'Failed to download image')
    },
  })
}
