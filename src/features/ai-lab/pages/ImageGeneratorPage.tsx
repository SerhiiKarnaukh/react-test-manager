import { useEffect } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import DownloadIcon from '@mui/icons-material/Download'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import { AI_LAB_HERO_IMAGES } from '@features/ai-lab/ai-lab.assets'
import { AiLabPageLayout } from '@features/ai-lab/components/AiLabPageLayout'
import { PromptForm } from '@features/ai-lab/components/PromptForm'
import { TypingIndicator } from '@features/ai-lab/components/TypingIndicator'
import { useDownloadGeneratedImage, useGenerateImage } from '@features/ai-lab/hooks/useAiLabImage'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'

export function ImageGeneratorPage() {
  const imageUrl = useAiLabStore((s) => s.imageUrl)
  const generateImage = useGenerateImage()
  const downloadImage = useDownloadGeneratedImage()

  useEffect(() => {
    document.title = 'Image Generator | AI Lab'
  }, [])

  const showResponse = generateImage.isPending || Boolean(imageUrl)

  return (
    <AiLabPageLayout title="Image Generator" heroImage={AI_LAB_HERO_IMAGES.image}>
      {showResponse ? (
        <Card variant="outlined" sx={{ minHeight: 80 }}>
          {generateImage.isPending ? (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }} aria-hidden>
                <SmartToyIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <TypingIndicator />
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <Box
                component="img"
                src={imageUrl}
                alt="Generated image"
                sx={{
                  display: 'block',
                  width: '100%',
                  maxHeight: 480,
                  objectFit: 'contain',
                  borderRadius: 1,
                  mb: 2,
                }}
              />
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => imageUrl && downloadImage.mutate(imageUrl)}
                disabled={!imageUrl || downloadImage.isPending}
              >
                Download Image
              </Button>
            </Box>
          )}
        </Card>
      ) : null}

      <PromptForm />
    </AiLabPageLayout>
  )
}
