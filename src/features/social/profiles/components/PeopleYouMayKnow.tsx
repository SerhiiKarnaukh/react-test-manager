import { Link as RouterLink } from 'react-router-dom'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { SOCIAL_DEFAULT_AVATAR } from '@features/social/profiles/api/profile.models'
import { useFriendSuggestions } from '@features/social/profiles/hooks/useProfile'

export function PeopleYouMayKnow() {
  const { data: suggestions = [] } = useFriendSuggestions()

  if (!suggestions.length) return null

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          People you may know
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {suggestions.map((user) => (
            <Box
              key={user.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flexWrap: 'wrap',
              }}
            >
              <Avatar
                src={user.avatar_url ?? SOCIAL_DEFAULT_AVATAR}
                alt={user.full_name}
                sx={{ width: 40, height: 40 }}
              />
              <Typography sx={{ flex: 1, minWidth: 120, fontWeight: 600 }}>
                {user.full_name}
              </Typography>
              <Button
                component={RouterLink}
                to={`/social/profile/${user.slug}`}
                variant="contained"
                size="small"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Show
              </Button>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}
