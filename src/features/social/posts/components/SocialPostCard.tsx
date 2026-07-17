import { Link as RouterLink } from 'react-router-dom'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CommentIcon from '@mui/icons-material/Comment'
import DeleteIcon from '@mui/icons-material/Delete'
import FlagIcon from '@mui/icons-material/Flag'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useState } from 'react'
import {
  SOCIAL_DEFAULT_AVATAR,
  type SocialPost,
} from '@features/social/posts/api/posts'
import {
  useDeletePost,
  useLikePost,
  useReportPost,
} from '@features/social/posts/hooks/usePosts'
import { useCurrentSocialUser } from '@features/social/profiles/hooks/useProfile'
import { useAuthStore } from '@core/auth/auth.store'

type SocialPostCardProps = {
  post: SocialPost
}

export function SocialPostCard({ post }: SocialPostCardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const { data: currentUser } = useCurrentSocialUser()
  const likeMutation = useLikePost()
  const reportMutation = useReportPost()
  const deleteMutation = useDeletePost()
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

  const authorName = `${post.created_by.first_name} ${post.created_by.last_name}`
  const avatarUrl = post.created_by.avatar_url ?? SOCIAL_DEFAULT_AVATAR
  const isOwnPost = currentUser?.id === post.created_by.id

  return (
    <Card variant="outlined" sx={{ overflow: 'visible' }}>
      <CardHeader
        avatar={<Avatar src={avatarUrl} alt={authorName} />}
        action={
          isAuthenticated ? (
            <>
              <IconButton
                aria-label="Post actions"
                onClick={(event) => setMenuAnchor(event.currentTarget)}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                {isOwnPost ? (
                  <MenuItem
                    onClick={() => {
                      setMenuAnchor(null)
                      deleteMutation.mutate(post.id)
                    }}
                  >
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Delete Post
                  </MenuItem>
                ) : (
                  <MenuItem
                    onClick={() => {
                      setMenuAnchor(null)
                      reportMutation.mutate(post.id)
                    }}
                  >
                    <FlagIcon fontSize="small" sx={{ mr: 1 }} />
                    Report Post
                  </MenuItem>
                )}
              </Menu>
            </>
          ) : null
        }
        title={
          <Typography
            component={RouterLink}
            to={`/social/profile/${post.created_by.slug}`}
            variant="subtitle1"
            sx={{
              color: 'info.main',
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {authorName}
          </Typography>
        }
        subheader={`${post.created_at_formatted} ago`}
      />

      <CardContent sx={{ pt: 0 }}>
        {post.body ? (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: post.attachments.length ? 2 : 0 }}>
            {post.body}
          </Typography>
        ) : null}

        {post.attachments.map((image) => (
          <Box
            key={image.id}
            component="img"
            src={image.image_url}
            alt="Post attachment"
            sx={{
              display: 'block',
              width: '100%',
              aspectRatio: '3 / 2',
              objectFit: 'cover',
              borderRadius: 1,
              mb: 1,
            }}
          />
        ))}

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          <Button
            startIcon={<ThumbUpIcon />}
            onClick={() => likeMutation.mutate(post.id)}
            disabled={likeMutation.isPending}
          >
            {post.likes_count}
          </Button>

          <Button
            component={RouterLink}
            to={`/social/${post.id}`}
            startIcon={<CommentIcon />}
          >
            {post.comments_count} comments
          </Button>

          {post.is_private ? (
            <Box
              sx={{
                ml: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'text.secondary',
              }}
            >
              <VisibilityOffIcon fontSize="small" />
              <Typography variant="body2">Private</Typography>
            </Box>
          ) : null}
        </Box>
      </CardContent>
    </Card>
  )
}
