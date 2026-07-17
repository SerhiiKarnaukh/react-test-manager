import { useRef, useState, type FormEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import TextField from '@mui/material/TextField'
import type { SelectedPostImage } from '@features/social/posts/api/posts'
import { useCreatePost } from '@features/social/posts/hooks/usePosts'

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/jpg'])

export function CreatePostForm() {
  const createPost = useCreatePost()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [body, setBody] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [images, setImages] = useState<SelectedPostImage[]>([])

  const canSubmit = Boolean(body.trim() || images.length) && !createPost.isPending

  const onFilesSelected = (fileList: FileList | null) => {
    if (!fileList?.length) return
    const next: SelectedPostImage[] = []
    for (const file of Array.from(fileList)) {
      if (!ACCEPTED_TYPES.has(file.type)) continue
      next.push({ url: URL.createObjectURL(file), file })
    }
    if (next.length) {
      setImages((current) => [...current, ...next])
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const resetForm = () => {
    images.forEach((image) => URL.revokeObjectURL(image.url))
    setBody('')
    setIsPrivate(false)
    setImages([])
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    const formData = new FormData()
    formData.append('body', body.trim())
    formData.append('is_private', String(isPrivate))
    images.forEach((image, index) => {
      formData.append(`images[${index}]`, image.file)
    })

    createPost.mutate(formData, {
      onSuccess: () => resetForm(),
    })
  }

  return (
    <Card variant="outlined">
      <Box component="form" onSubmit={handleSubmit}>
        <CardContent>
          <TextField
            label="What are you thinking about?"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            multiline
            rows={4}
            fullWidth
          />
        </CardContent>

        {images.length > 0 ? (
          <>
            <Divider />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 2, py: 1.5 }}>
              {images.map((image) => (
                <Box
                  key={image.url}
                  component="img"
                  src={image.url}
                  alt="Selected attachment"
                  sx={{
                    width: 96,
                    height: 96,
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
                />
              ))}
            </Box>
          </>
        ) : null}

        <Divider />

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.5,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg"
            multiple
            hidden
            onChange={(event) => onFilesSelected(event.target.files)}
          />

          <Button variant="outlined" type="button" onClick={() => fileInputRef.current?.click()}>
            Attach image
          </Button>

          <Button variant="contained" type="submit" disabled={!canSubmit}>
            Post
          </Button>

          <FormControlLabel
            control={
              <Checkbox
                checked={isPrivate}
                onChange={(event) => setIsPrivate(event.target.checked)}
              />
            }
            label={isPrivate ? "It's a private post" : 'Make it private'}
          />
        </Box>
      </Box>
    </Card>
  )
}
