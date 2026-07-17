import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTrends } from '@features/social/posts/hooks/usePosts'

export function Trends() {
  const { data: trends = [] } = useTrends()

  if (!trends.length) return null

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Trends
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {trends.map((trend) => (
            <Box
              key={trend.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  #{trend.hashtag}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {trend.occurences} posts
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to={`/social/trends/${trend.hashtag}`}
                variant="outlined"
                size="small"
              >
                Explore
              </Button>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}
