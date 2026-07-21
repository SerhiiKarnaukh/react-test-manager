import { useRef, type KeyboardEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { useForm, useWatch } from 'react-hook-form'
import { useAlertStore } from '@core/alert/alert.store'
import {
  PROMPT_IMAGE_ALLOWED_TYPES,
  PROMPT_IMAGE_MAX_BYTES,
  PROMPT_MAX_LENGTH,
  resolvePromptFormMode,
} from '@features/ai-lab/api/ai-lab.models'
import { useAiLabRealtime } from '@features/ai-lab/hooks/useAiLabRealtime'
import {
  useDeletePromptImage,
  useSendChatMessage,
  useUploadPromptImages,
} from '@features/ai-lab/hooks/useAiLabChat'
import { useGenerateImage } from '@features/ai-lab/hooks/useAiLabImage'
import { useGenerateVoice } from '@features/ai-lab/hooks/useAiLabVoice'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'
import { promptSchema, type PromptFormValues } from '@features/ai-lab/validation/prompt.schemas'

export function PromptForm() {
  const location = useLocation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mode = resolvePromptFormMode(location.pathname)
  const promptImages = useAiLabStore((s) => s.promptImages)
  const uploadingImages = useAiLabStore((s) => s.uploadingImages)
  const appendRealtimeMessage = useAiLabStore((s) => s.appendRealtimeMessage)
  const setRealtimeLoading = useAiLabStore((s) => s.setRealtimeLoading)
  const enqueue = useAlertStore((s) => s.enqueue)

  const sendChat = useSendChatMessage()
  const generateImage = useGenerateImage()
  const generateVoice = useGenerateVoice()
  const uploadImages = useUploadPromptImages()
  const deleteImage = useDeletePromptImage()
  const { connect, sendMessage, isReady } = useAiLabRealtime()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PromptFormValues>({
    resolver: zodResolver(promptSchema),
    defaultValues: { prompt: '' },
  })

  const promptValue = useWatch({ control, name: 'prompt', defaultValue: '' })
  const promptLength = promptValue.length
  const showAddImages = mode === 'chat'
  const submitLabel = mode === 'image' || mode === 'voice' ? 'Generate' : 'Ask Me'
  const isBusy =
    isSubmitting ||
    sendChat.isPending ||
    generateImage.isPending ||
    generateVoice.isPending ||
    uploadImages.isPending

  const onSubmit = async (values: PromptFormValues) => {
    const question = values.prompt.trim()

    switch (mode) {
      case 'image':
        await generateImage.mutateAsync(question)
        break
      case 'voice':
        await generateVoice.mutateAsync(question)
        break
      case 'realtime': {
        if (!isReady()) {
          await connect()
        }
        if (!isReady()) return
        appendRealtimeMessage('me', question)
        setRealtimeLoading(true)
        sendMessage(question)
        break
      }
      default:
        await sendChat.mutateAsync(question)
    }

    reset({ prompt: '' })
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSubmit(onSubmit)()
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return

    const validFiles = Array.from(files).filter((file) => {
      if (!PROMPT_IMAGE_ALLOWED_TYPES.includes(file.type as (typeof PROMPT_IMAGE_ALLOWED_TYPES)[number])) {
        return false
      }
      if (file.size > PROMPT_IMAGE_MAX_BYTES) {
        enqueue('error', `Sorry, the file "${file.name}" size cannot be larger than 20MB`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      await uploadImages.mutateAsync(validFiles)
    }

    event.target.value = ''
  }

  return (
    <Card variant="outlined">
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent sx={{ pt: 1.5, pb: 0 }}>
          <TextField
            {...register('prompt')}
            label="Prompt"
            placeholder="How can I help?"
            multiline
            rows={4}
            fullWidth
            error={Boolean(errors.prompt)}
            helperText={errors.prompt?.message ?? `${promptLength}/${PROMPT_MAX_LENGTH}`}
            slotProps={{
              htmlInput: { maxLength: PROMPT_MAX_LENGTH },
              formHelperText: { sx: { textAlign: 'right', mr: 0 } },
            }}
            onKeyDown={handleKeyDown}
          />
        </CardContent>

        {uploadingImages ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
            <CircularProgress size={32} />
          </Box>
        ) : showAddImages && promptImages.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
              gap: 1.5,
              px: 2,
              pb: 2,
            }}
          >
            {promptImages.map((image, index) => (
              <Box
                key={`${image}-${index}`}
                sx={{
                  position: 'relative',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 0.5,
                }}
              >
                <IconButton
                  size="small"
                  aria-label="Remove image"
                  onClick={() => deleteImage.mutate({ index, imageUrl: image })}
                  sx={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                <Box
                  component="img"
                  src={image}
                  alt="Uploaded prompt image"
                  sx={{
                    display: 'block',
                    width: '100%',
                    maxHeight: 100,
                    objectFit: 'cover',
                    borderRadius: 0.5,
                  }}
                />
              </Box>
            ))}
          </Box>
        ) : null}

        <Divider sx={{ mt: 0.5 }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
          }}
        >
          {showAddImages ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="image/png, image/jpeg"
                multiple
                onChange={handleFileChange}
              />
              <Button
                variant="outlined"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                Add Images
              </Button>
            </>
          ) : (
            <span />
          )}

          <Button variant="contained" type="submit" disabled={isBusy}>
            {submitLabel}
          </Button>
        </Box>
      </Box>
    </Card>
  )
}
