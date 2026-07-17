import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import { useAuthStore } from '@core/auth/auth.store'
import { CommentItem } from '@features/social/posts/components/CommentItem'
import { SocialPageLayout } from '@features/social/posts/components/SocialPageLayout'
import { SocialPostCard } from '@features/social/posts/components/SocialPostCard'
import { Trends } from '@features/social/posts/components/Trends'
import { useAddComment, usePostDetail } from '@features/social/posts/hooks/usePosts'

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const { data, isPending } = usePostDetail(id)
  const addComment = useAddComment(id ?? '')
  const [commentBody, setCommentBody] = useState('')
  const post = data?.post

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = commentBody.trim()
    if (!trimmed || !id) return
    addComment.mutate(trimmed, {
      onSuccess: () => setCommentBody(''),
    })
  }

  return (
    <SocialPageLayout
      main={
        <>
          {isPending && !post?.id ? (
            <Card variant="outlined">
              <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={40} />
              </CardContent>
            </Card>
          ) : null}

          {post?.id ? (
            <>
              <SocialPostCard post={post} />

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  ml: { xs: 2, sm: 4 },
                }}
              >
                {post.comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </Box>

              {isAuthenticated ? (
                <Card variant="outlined">
                  <Box component="form" onSubmit={handleSubmit}>
                    <CardContent>
                      <TextField
                        label="What do you think?"
                        value={commentBody}
                        onChange={(event) => setCommentBody(event.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                        required
                      />
                    </CardContent>
                    <Box sx={{ px: 2, pb: 2 }}>
                      <Button
                        variant="contained"
                        type="submit"
                        disabled={!commentBody.trim() || addComment.isPending}
                      >
                        Comment
                      </Button>
                    </Box>
                  </Box>
                </Card>
              ) : null}
            </>
          ) : null}
        </>
      }
      sidebar={<Trends />}
    />
  )
}
