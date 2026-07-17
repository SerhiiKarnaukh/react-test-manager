import { Link as RouterLink } from 'react-router-dom'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import {
  SOCIAL_DEFAULT_AVATAR,
  type SocialComment,
} from '@features/social/posts/api/posts'

type CommentItemProps = {
  comment: SocialComment
}

export function CommentItem({ comment }: CommentItemProps) {
  const authorName = `${comment.created_by.first_name} ${comment.created_by.last_name}`
  const avatarUrl = comment.created_by.avatar_url ?? SOCIAL_DEFAULT_AVATAR

  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<Avatar src={avatarUrl} alt={authorName} />}
        title={
          <Typography
            component={RouterLink}
            to={`/social/profile/${comment.created_by.slug}`}
            variant="subtitle2"
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
        subheader={`${comment.created_at_formatted} ago`}
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {comment.body}
        </Typography>
      </CardContent>
    </Card>
  )
}
